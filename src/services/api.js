/**
 * Real API Service (Main Export)
 * This file aggregates all domain APIs for convenient access
 *
 * Architecture: Domain-based API separation
 * Each domain is in: src/services/domains/[domain].js
 * Shared utilities in: src/services/domains/utils.js
 */

import authAPI from "./domains/auth";
import categoriesAPI from "./domains/categories";
import requestsAPI from "./domains/requests";
import quotesAPI from "./domains/quotes";
import freelancersAPI from "./domains/freelancers";
import usersAPI from "./domains/users";
import jobsAPI from "./domains/jobs";
import messagesAPI from "./domains/messages";
import notificationsAPI from "./domains/notifications";
import paymentsAPI from "./domains/payments";
import reviewsAPI from "./domains/reviews";
import reportsAPI from "./domains/reports";
import complaintsAPI from "./domains/complaints";
import progressAPI from "./domains/progress";
import statisticsAPI from "./domains/statistics";

// ==================== AGGREGATED API ====================
const api = {
  auth: authAPI,
  categories: categoriesAPI,
  requests: requestsAPI,
  quotes: quotesAPI,
  freelancers: freelancersAPI,
  users: usersAPI,
  jobs: jobsAPI,
  messages: messagesAPI,
  notifications: notificationsAPI,
  payments: paymentsAPI,
  reviews: reviewsAPI,
  reports: reportsAPI,
  complaints: complaintsAPI,
  progress: progressAPI,
  statistics: statisticsAPI,
};

export default api;
