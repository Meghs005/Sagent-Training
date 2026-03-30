package com.example.parking_spot_finder.dto;

public class BookingRequestDTO {

    private Long userId;
    private Long slotId;
    private Long vehicleId;
    private String startTime;
    private String endTime;

    // ✅ Getter for userId
    public Long getUserId() {
        return userId;
    }

    // ✅ Setter for userId
    public void setUserId(Long userId) {
        this.userId = userId;
    }

    // ✅ Getter for slotId
    public Long getSlotId() {
        return slotId;
    }

    // ✅ Setter for slotId
    public void setSlotId(Long slotId) {
        this.slotId = slotId;
    }

    // ✅ Getter for vehicleId
    public Long getVehicleId() {
        return vehicleId;
    }

    // ✅ Setter for vehicleId
    public void setVehicleId(Long vehicleId) {
        this.vehicleId = vehicleId;
    }

    // ✅ Getter for startTime
    public String getStartTime() {
        return startTime;
    }

    // ✅ Setter for startTime
    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    // ✅ Getter for endTime
    public String getEndTime() {
        return endTime;
    }

    // ✅ Setter for endTime
    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }
}