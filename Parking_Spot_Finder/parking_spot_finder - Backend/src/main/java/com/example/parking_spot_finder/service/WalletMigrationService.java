package com.example.parking_spot_finder.service;

import com.example.parking_spot_finder.model.*;
import com.example.parking_spot_finder.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class WalletMigrationService {

    @Autowired private BookingRepository           bookingRepository;
    @Autowired private WalletRepository            walletRepository;
    @Autowired private WalletTransactionRepository transactionRepository;
    @Autowired private UserRepository              userRepository;

    private static final BigDecimal ADVANCE_RATIO    = new BigDecimal("0.50");
    private static final BigDecimal ADMIN_COMMISSION = new BigDecimal("0.10");

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

    private void credit(Wallet wallet, BigDecimal amount, Booking booking, String purpose) {
        WalletTransaction t = new WalletTransaction();
        t.setWallet(wallet);
        t.setBooking(booking);
        t.setAmount(amount);
        t.setTransactionType("CREDIT");
        t.setPurpose(purpose);
        t.setTransactionStatus("SUCCESS");
        t.setTransactionTime(booking.getBookingDate() != null
                ? booking.getBookingDate().atStartOfDay() : LocalDateTime.now());
        transactionRepository.save(t);

        BigDecimal real = computeRealBalance(wallet.getWalletId());
        wallet.setBalance(real);
        wallet.setLastUpdated(LocalDateTime.now());
        walletRepository.save(wallet);
    }

    /**
     * Scans every booking and back-fills lender/admin credit transactions
     * for any booking that does NOT already have them.
     * Returns a summary of what was processed.
     */
    public Map<String, Object> runMigration() {
        List<Booking> allBookings = bookingRepository.findAll();
        List<WalletTransaction> allTxns = transactionRepository.findAll();

        // Build set of booking IDs that already have admin commission credited
        Set<Long> alreadyHasAdminCommission = allTxns.stream()
                .filter(t -> t.getPurpose() != null && t.getPurpose().contains("ADMIN_COMMISSION"))
                .filter(t -> t.getBooking() != null)
                .map(t -> t.getBooking().getBookingId())
                .collect(Collectors.toSet());

        // Build set of booking IDs that already have lender credit
        Set<Long> alreadyHasLenderCredit = allTxns.stream()
                .filter(t -> t.getPurpose() != null && t.getPurpose().contains("LENDER_"))
                .filter(t -> t.getBooking() != null)
                .map(t -> t.getBooking().getBookingId())
                .collect(Collectors.toSet());

        // Find admin user
        List<User> admins = userRepository.findByRole("ADMIN");
        User adminUser = admins.isEmpty() ? null : admins.get(0);

        int processed = 0, skipped = 0;
        List<String> log = new ArrayList<>();

        for (Booking b : allBookings) {
            String status = b.getBookingStatus();

            // Only process bookings that involved real money
            boolean hasMoney = "CONFIRMED".equals(status)
                    || "CHECKED_OUT".equals(status)
                    || "CANCELLED".equals(status);
            if (!hasMoney) { skipped++; continue; }

            // Check if booking had advance paid (either CONFIRMED, CHECKED_OUT, or CANCELLED-after-confirm)
            boolean hadAdvance = !"PENDING_PAYMENT".equals(status);
            // For cancelled: check if it was confirmed before cancel (estimatedAmt > 0 and checkoutStatus present)
            if ("CANCELLED".equals(status)) {
                // If cancellationReason contains "hold released" it was never paid
                String cr = b.getCancellationReason();
                if (cr != null && cr.contains("hold released")) { skipped++; continue; }
                if (cr != null && cr.contains("expired"))        { skipped++; continue; }
                if (b.getEstimatedAmt() == null || b.getEstimatedAmt().compareTo(BigDecimal.ZERO) == 0) {
                    skipped++; continue;
                }
            }

            BigDecimal estimated = b.getEstimatedAmt();
            if (estimated == null || estimated.compareTo(BigDecimal.ZERO) == 0) { skipped++; continue; }

            User lenderUser = b.getSlot() != null && b.getSlot().getSpot() != null
                    ? b.getSlot().getSpot().getUser() : null;
            if (lenderUser == null) { skipped++; log.add("Booking #" + b.getBookingId() + ": lender not found — skipped"); continue; }

            // ── Back-fill advance payment split (if not already done) ──
            if (!alreadyHasAdminCommission.contains(b.getBookingId()) &&
                    !alreadyHasLenderCredit.contains(b.getBookingId())) {

                BigDecimal advance      = estimated.multiply(ADVANCE_RATIO).setScale(2, RoundingMode.HALF_UP);
                BigDecimal adminCut     = advance.multiply(ADMIN_COMMISSION).setScale(2, RoundingMode.HALF_UP);
                BigDecimal lenderAmount = advance.subtract(adminCut);

                // Credit lender
                Wallet lenderWallet = getOrCreateWallet(lenderUser);
                credit(lenderWallet, lenderAmount, b, "LENDER_ADVANCE_BACKFILL");

                // Credit admin
                if (adminUser != null) {
                    Wallet adminWallet = getOrCreateWallet(adminUser);
                    credit(adminWallet, adminCut, b, "ADMIN_COMMISSION_ADVANCE_BACKFILL");
                }

                log.add("Booking #" + b.getBookingId() + ": advance split → lender ₹" + lenderAmount + ", admin ₹" + adminCut);
                processed++;

                // ── If also CHECKED_OUT: back-fill checkout payment split ──
                if ("CHECKED_OUT".equals(status)) {
                    BigDecimal lateFee    = b.getAdditionalFee() != null ? b.getAdditionalFee() : BigDecimal.ZERO;
                    BigDecimal remaining  = estimated.subtract(advance).add(lateFee);
                    BigDecimal adminCut2  = remaining.multiply(ADMIN_COMMISSION).setScale(2, RoundingMode.HALF_UP);
                    BigDecimal lender2    = remaining.subtract(adminCut2);

                    credit(lenderWallet, lender2, b, "LENDER_CHECKOUT_BACKFILL");
                    if (adminUser != null) {
                        Wallet adminWallet = getOrCreateWallet(adminUser);
                        credit(adminWallet, adminCut2, b, "ADMIN_COMMISSION_CHECKOUT_BACKFILL");
                    }
                    log.add("  + checkout split → lender ₹" + lender2 + ", admin ₹" + adminCut2);
                }
            } else {
                skipped++;
                log.add("Booking #" + b.getBookingId() + ": already has distribution — skipped");
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalBookings",  allBookings.size());
        result.put("processed",      processed);
        result.put("skipped",        skipped);
        result.put("adminUserFound", adminUser != null);
        result.put("adminUserId",    adminUser != null ? adminUser.getUserId() : null);
        result.put("log",            log);
        return result;
    }
}
