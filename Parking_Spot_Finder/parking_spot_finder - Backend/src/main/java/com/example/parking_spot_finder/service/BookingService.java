package com.example.parking_spot_finder.service;

import com.example.parking_spot_finder.model.*;
import com.example.parking_spot_finder.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
public class BookingService {

    @Autowired private BookingRepository           bookingRepository;
    @Autowired private ParkingSlotRepository       slotRepository;
    @Autowired private VehicleRepository           vehicleRepository;
    @Autowired private UserRepository              userRepository;
    @Autowired private WalletRepository            walletRepository;
    @Autowired private WalletTransactionRepository transactionRepository;

    private static final BigDecimal ADVANCE_RATIO    = new BigDecimal("0.50");
    private static final BigDecimal ADMIN_COMMISSION = new BigDecimal("0.10");
    private static final long       HOLD_MINUTES     = 10L;

    // ─── Helpers ─────────────────────────────────────────────────────────────

    /** Find the first user with role ADMIN — no hardcoded ID. */
    private User findAdminUser() {
        List<User> admins = userRepository.findByRole("ADMIN");
        return admins.isEmpty() ? null : admins.get(0);
    }

    /** Compute real wallet balance from transaction history (avoids stale DB column). */
    private BigDecimal computeRealBalance(Long walletId) {
        List<WalletTransaction> txns = transactionRepository.findByWalletWalletId(walletId);
        BigDecimal bal = BigDecimal.ZERO;
        for (WalletTransaction t : txns) {
            BigDecimal amt = t.getAmount() == null ? BigDecimal.ZERO : t.getAmount();
            if ("CREDIT".equalsIgnoreCase(t.getTransactionType()) ||
                    "REFUND".equalsIgnoreCase(t.getTransactionType()))  bal = bal.add(amt);
            else if ("DEBIT".equalsIgnoreCase(t.getTransactionType())) bal = bal.subtract(amt);
        }
        return bal;
    }

    /** Get or create wallet for a user. */
    private Wallet getOrCreateWallet(User user) {
        Wallet w = walletRepository.findByUserUserId(user.getUserId());
        if (w == null) {
            w = new Wallet();
            w.setUser(user);
            w.setBalance(BigDecimal.ZERO);
            w.setLastUpdated(LocalDateTime.now());
            w = walletRepository.save(w);
        }
        return w;
    }

    /** Record a CREDIT transaction and update wallet balance. */
    private void creditWallet(Wallet wallet, BigDecimal amount, Booking booking, String purpose) {
        BigDecimal real = computeRealBalance(wallet.getWalletId());
        wallet.setBalance(real.add(amount));
        wallet.setLastUpdated(LocalDateTime.now());
        walletRepository.save(wallet);

        WalletTransaction t = new WalletTransaction();
        t.setWallet(wallet);
        t.setBooking(booking);
        t.setAmount(amount);
        t.setTransactionType("CREDIT");
        t.setPurpose(purpose);
        t.setTransactionStatus("SUCCESS");
        t.setTransactionTime(LocalDateTime.now());
        transactionRepository.save(t);
    }

    /** Record a DEBIT transaction; throws if insufficient balance. */
    private void debitWallet(Wallet wallet, BigDecimal amount, Booking booking, String purpose) {
        BigDecimal real = computeRealBalance(wallet.getWalletId());
        if (real.compareTo(amount) < 0) {
            throw new RuntimeException(
                    "Insufficient wallet balance. Required: ₹" + amount + ", Available: ₹" + real);
        }
        wallet.setBalance(real.subtract(amount));
        wallet.setLastUpdated(LocalDateTime.now());
        walletRepository.save(wallet);

        WalletTransaction t = new WalletTransaction();
        t.setWallet(wallet);
        t.setBooking(booking);
        t.setAmount(amount);
        t.setTransactionType("DEBIT");
        t.setPurpose(purpose);
        t.setTransactionStatus("SUCCESS");
        t.setTransactionTime(LocalDateTime.now());
        transactionRepository.save(t);
    }

    /** Distribute a payment: 10% → admin, 90% → lender. */
    private void distributePayment(BigDecimal amount, Booking booking, String purpose) {
        BigDecimal adminCut     = amount.multiply(ADMIN_COMMISSION).setScale(2, RoundingMode.HALF_UP);
        BigDecimal lenderAmount = amount.subtract(adminCut);

        // Credit lender (always)
        User   lenderUser   = booking.getSlot().getSpot().getUser();
        Wallet lenderWallet = getOrCreateWallet(lenderUser);
        creditWallet(lenderWallet, lenderAmount, booking, "LENDER_" + purpose);

        // Credit admin (find by role — no hardcoded ID)
        User adminUser = findAdminUser();
        if (adminUser != null) {
            Wallet adminWallet = getOrCreateWallet(adminUser);
            creditWallet(adminWallet, adminCut, booking, "ADMIN_COMMISSION_" + purpose);
        }
        // If no admin user exists yet the commission is simply not credited
        // (won't cause booking failure)
    }

    // ─── Steps ───────────────────────────────────────────────────────────────

    /**
     * STEP 1 — Create hold (no money moved).
     * Slot → RESERVED. Booking → PENDING_PAYMENT.
     */
    public Booking createBooking(Booking b) {
        ParkingSlot slot    = slotRepository.findById(b.getSlot().getSlotId())
                .orElseThrow(() -> new RuntimeException("Slot not found: " + b.getSlot().getSlotId()));
        Vehicle     vehicle = vehicleRepository.findById(b.getVehicle().getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found: " + b.getVehicle().getVehicleId()));
        User        user    = userRepository.findById(b.getUser().getUserId())
                .orElseThrow(() -> new RuntimeException("User not found: " + b.getUser().getUserId()));

        if (!"AVAILABLE".equalsIgnoreCase(slot.getStatus()))
            throw new RuntimeException("Slot " + slot.getSlotNo() + " is not available.");

        long   minutes   = ChronoUnit.MINUTES.between(b.getStartTime(), b.getEndTime());
        double hrs       = minutes / 60.0;
        BigDecimal price = slot.getSpot().getPricePerHr();
        BigDecimal estimated = price.multiply(BigDecimal.valueOf(hrs)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal advance   = estimated.multiply(ADVANCE_RATIO).setScale(2, RoundingMode.HALF_UP);

        slot.setStatus("RESERVED");
        slotRepository.save(slot);

        b.setUser(user);
        b.setSlot(slot);
        b.setVehicle(vehicle);
        b.setBookingDate(LocalDate.now());
        b.setBookingStatus("PENDING_PAYMENT");
        b.setBookingCode(generateCode());
        b.setEstimatedAmt(estimated);
        b.setAdditionalFee(BigDecimal.ZERO);
        b.setFinalAmt(estimated.subtract(advance));
        b.setCheckoutStatus("AWAITING_ADVANCE");
        b.setCancellationReason("HOLD_EXPIRES:" +
                LocalDateTime.now().plusMinutes(HOLD_MINUTES).toString());

        return bookingRepository.save(b);
    }

    /**
     * STEP 2 — Pay advance (confirms booking).
     * Debit user → 10% admin, 90% lender.
     */
    public Booking payAdvance(Long bookingId) {
        Booking b = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));

        if (!"PENDING_PAYMENT".equals(b.getBookingStatus()))
            throw new RuntimeException("Booking is not awaiting payment (status: " + b.getBookingStatus() + ").");

        // Check hold expiry
        String holdInfo = b.getCancellationReason();
        if (holdInfo != null && holdInfo.startsWith("HOLD_EXPIRES:")) {
            LocalDateTime expiry = LocalDateTime.parse(holdInfo.replace("HOLD_EXPIRES:", ""));
            if (LocalDateTime.now().isAfter(expiry)) {
                b.getSlot().setStatus("AVAILABLE");
                slotRepository.save(b.getSlot());
                b.setBookingStatus("CANCELLED");
                b.setCancellationReason("Reservation hold expired.");
                b.setCancellationTime(LocalDateTime.now());
                bookingRepository.save(b);
                throw new RuntimeException("Reservation hold expired. Please create a new booking.");
            }
        }

        BigDecimal advance = b.getEstimatedAmt().multiply(ADVANCE_RATIO).setScale(2, RoundingMode.HALF_UP);

        // Debit user
        User   user       = userRepository.findById(b.getUser().getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Wallet userWallet = getOrCreateWallet(user);
        debitWallet(userWallet, advance, b, "ADVANCE_PAYMENT");

        // Distribute: 10% admin, 90% lender
        distributePayment(advance, b, "ADVANCE");

        b.setBookingStatus("CONFIRMED");
        b.setCheckoutStatus("ADVANCE_PAID");
        b.setCancellationReason(null);

        return bookingRepository.save(b);
    }

    /** Cancel booking with refund policy (>60 min = full refund). */
    public String cancelBooking(Long id) {
        Booking b = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + id));

        if ("CANCELLED".equals(b.getBookingStatus())) return "Booking already cancelled.";

        LocalDateTime now          = LocalDateTime.now();
        long minutesUntilStart     = ChronoUnit.MINUTES.between(now, b.getStartTime());
        boolean wasConfirmed       = "CONFIRMED".equals(b.getBookingStatus());

        b.getSlot().setStatus("AVAILABLE");
        slotRepository.save(b.getSlot());
        b.setBookingStatus("CANCELLED");
        b.setCancellationTime(now);

        if (wasConfirmed && minutesUntilStart > 60) {
            BigDecimal advance      = b.getEstimatedAmt().multiply(ADVANCE_RATIO).setScale(2, RoundingMode.HALF_UP);
            BigDecimal adminCut     = advance.multiply(ADMIN_COMMISSION).setScale(2, RoundingMode.HALF_UP);
            BigDecimal lenderAmount = advance.subtract(adminCut);

            // Refund user
            User   user       = userRepository.findById(b.getUser().getUserId()).orElse(null);
            if (user != null) {
                Wallet uw = getOrCreateWallet(user);
                creditWallet(uw, advance, b, "CANCELLATION_REFUND");
            }
            // Reverse from lender
            User   lenderUser = b.getSlot().getSpot().getUser();
            Wallet lw         = getOrCreateWallet(lenderUser);
            debitWallet(lw, lenderAmount, b, "CANCELLATION_REFUND_REVERSAL");

            // Reverse from admin
            User adminUser = findAdminUser();
            if (adminUser != null) {
                Wallet aw = getOrCreateWallet(adminUser);
                debitWallet(aw, adminCut, b, "COMMISSION_REVERSAL_CANCEL");
            }

            b.setCancellationReason("Cancelled — advance ₹" + advance + " refunded (>1hr before start).");
        } else if (wasConfirmed) {
            b.setCancellationReason("Cancelled — no refund (within 1hr of start). Advance forfeited.");
        } else {
            b.setCancellationReason("Cancelled — hold released (payment not completed).");
        }

        bookingRepository.save(b);
        return b.getCancellationReason();
    }

    /** Checkout: collect remaining 50% + late fees. */
    public Booking checkout(Long id) {
        Booking b = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + id));

        if (!"CONFIRMED".equals(b.getBookingStatus()))
            throw new RuntimeException("Booking is not CONFIRMED.");

        LocalDateTime now = LocalDateTime.now();

        BigDecimal lateFee = BigDecimal.ZERO;
        if (now.isAfter(b.getEndTime())) {
            long   lateMinutes = ChronoUnit.MINUTES.between(b.getEndTime(), now);
            double lateHrs     = lateMinutes / 60.0;
            BigDecimal rate    = b.getSlot().getSpot().getPricePerHr();
            lateFee = rate.multiply(BigDecimal.valueOf(lateHrs * 1.5)).setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal advance   = b.getEstimatedAmt().multiply(ADVANCE_RATIO).setScale(2, RoundingMode.HALF_UP);
        BigDecimal remaining = b.getEstimatedAmt().subtract(advance).add(lateFee);

        User   user       = userRepository.findById(b.getUser().getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Wallet userWallet = getOrCreateWallet(user);
        debitWallet(userWallet, remaining, b,
                lateFee.compareTo(BigDecimal.ZERO) > 0 ? "CHECKOUT_WITH_LATE_FEE" : "CHECKOUT_PAYMENT");

        distributePayment(remaining, b, "CHECKOUT");

        b.getSlot().setStatus("AVAILABLE");
        slotRepository.save(b.getSlot());

        b.setCheckoutTime(now);
        b.setAdditionalFee(lateFee);
        b.setFinalAmt(b.getEstimatedAmt().add(lateFee));
        b.setBookingStatus("CHECKED_OUT");
        b.setCheckoutStatus("COMPLETED");

        return bookingRepository.save(b);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    private String generateCode() {
        return "PK" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }
}
