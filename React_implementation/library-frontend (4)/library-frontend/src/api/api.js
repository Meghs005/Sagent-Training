/**
 * api.js — Central API module for LibrariumOS
 * 
 * Exports:
 *  - default `api`         → raw axios instance (baseURL: http://localhost:8080/api)
 *  - userApi               → /api/users
 *  - bookApi               → /api/books
 *  - issueApi              → /api/issues
 *  - notifyApi             → /api/notifications
 *  - fineUtils             → fine calculation helpers
 *  - FINE_RATES            → configurable fine rate constants
 */

import axios from 'axios';

// ─── Axios Instance ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach token if present in future auth upgrades
api.interceptors.request.use((config) => {
  return config;
});

// Response interceptor — normalize errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;

// ─── Fine Rate Constants (₹) ─────────────────────────────────────────────────
export const FINE_RATES = {
  PER_DAY_OVERDUE: 5,       // ₹5 per day after due date
  LOST_BOOK_FLAT: 500,      // ₹500 flat fine for lost book
  TORN_BOOK_FLAT: 200,      // ₹200 flat fine for torn/damaged book
  LOST_BOOK_OVERDUE_INCLUDE: true,  // also add overdue fine on top of lost fine
};

// ─── Fine Utilities ───────────────────────────────────────────────────────────
export const fineUtils = {
  /**
   * Calculate overdue fine based on how many days past the due date.
   * @param {string} dueDate  - ISO date string "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm:ss"
   * @param {string} [returnDate] - ISO date string; defaults to today if not provided
   * @returns {{ overdueDays: number, overdueFine: number }}
   */
  calcOverdueFine(dueDate, returnDate = null) {
    if (!dueDate) return { overdueDays: 0, overdueFine: 0 };
    const due = new Date(dueDate.split('T')[0]);
    const ret = returnDate ? new Date(returnDate) : new Date();
    due.setHours(0, 0, 0, 0);
    ret.setHours(0, 0, 0, 0);
    const diffMs = ret - due;
    const overdueDays = diffMs > 0 ? Math.ceil(diffMs / (1000 * 60 * 60 * 24)) : 0;
    return {
      overdueDays,
      overdueFine: overdueDays * FINE_RATES.PER_DAY_OVERDUE,
    };
  },

  /**
   * Calculate total fine based on issue condition and overdue status.
   * @param {Object} params
   * @param {string} params.dueDate       - ISO date string
   * @param {string} [params.returnDate]  - ISO date string or null
   * @param {'OVERDUE'|'LOST'|'TORN'|'ISSUED'|'RETURNED'} params.status
   * @param {string} [params.condition]   - 'LOST' | 'TORN' | 'GOOD' (book condition)
   * @returns {{ overdueDays: number, overdueFine: number, conditionFine: number, totalFine: number, breakdown: string[] }}
   */
  calcTotalFine({ dueDate, returnDate, status, condition = 'GOOD' }) {
    const breakdown = [];
    let conditionFine = 0;

    const { overdueDays, overdueFine } = fineUtils.calcOverdueFine(dueDate, returnDate);

    if (overdueDays > 0) {
      breakdown.push(`Overdue: ${overdueDays} day${overdueDays > 1 ? 's' : ''} × ₹${FINE_RATES.PER_DAY_OVERDUE} = ₹${overdueFine}`);
    }

    if (condition === 'LOST' || status === 'LOST') {
      conditionFine = FINE_RATES.LOST_BOOK_FLAT;
      breakdown.push(`Lost book penalty: ₹${FINE_RATES.LOST_BOOK_FLAT}`);
    } else if (condition === 'TORN' || status === 'TORN') {
      conditionFine = FINE_RATES.TORN_BOOK_FLAT;
      breakdown.push(`Damaged/torn book penalty: ₹${FINE_RATES.TORN_BOOK_FLAT}`);
    }

    const totalFine = overdueFine + conditionFine;
    if (totalFine > 0) {
      breakdown.push(`──────────────`);
      breakdown.push(`Total Fine: ₹${totalFine}`);
    }

    return { overdueDays, overdueFine, conditionFine, totalFine, breakdown };
  },

  /**
   * Auto-detect whether an issue is overdue based on due date.
   * @param {string} dueDate
   * @param {string} currentStatus
   * @returns {string} updated status
   */
  resolveStatus(dueDate, currentStatus) {
    if (currentStatus === 'RETURNED' || currentStatus === 'LOST' || currentStatus === 'TORN') {
      return currentStatus;
    }
    if (!dueDate) return currentStatus;
    const due = new Date(dueDate.split('T')[0]);
    due.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now > due ? 'OVERDUE' : 'ISSUED';
  },
};

// ─── User API ─────────────────────────────────────────────────────────────────
export const userApi = {
  getAll:    ()           => api.get('/users'),
  getById:   (id)         => api.get(`/users/${id}`),
  create:    (data)       => api.post('/users', data),
  update:    (id, data)   => api.put(`/users/${id}`, data),
  delete:    (id)         => api.delete(`/users/${id}`),
};

// ─── Book (Stock) API ─────────────────────────────────────────────────────────
export const bookApi = {
  getAll:    ()           => api.get('/books'),
  getById:   (id)         => api.get(`/books/${id}`),
  getByUser: (userId)     => api.get(`/books/user/${userId}`),
  create:    (data)       => api.post('/books', data),
  update:    (id, data)   => api.put(`/books/${id}`, data),
  delete:    (id)         => api.delete(`/books/${id}`),
};

// ─── Issue API ────────────────────────────────────────────────────────────────
export const issueApi = {
  getAll:       ()             => api.get('/issues'),
  getById:      (id)           => api.get(`/issues/${id}`),
  getByUser:    (userId)       => api.get(`/issues/user/${userId}`),
  getByBook:    (bookId)       => api.get(`/issues/book/${bookId}`),
  getByStatus:  (status)       => api.get(`/issues/status/${status}`),
  create:       (data)         => api.post('/issues', data),
  update:       (id, data)     => api.put(`/issues/${id}`, data),
  delete:       (id)           => api.delete(`/issues/${id}`),
};

// ─── Notification API ─────────────────────────────────────────────────────────
export const notifyApi = {
  getAll:      ()              => api.get('/notifications'),
  getById:     (id)            => api.get(`/notifications/${id}`),
  getByUser:   (userId)        => api.get(`/notifications/user/${userId}`),
  getByIssue:  (issueId)       => api.get(`/notifications/issue/${issueId}`),
  create:      (data)          => api.post('/notifications', data),
  update:      (id, data)      => api.put(`/notifications/${id}`, data),
  delete:      (id)            => api.delete(`/notifications/${id}`),
};
