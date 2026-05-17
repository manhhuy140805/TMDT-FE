/**
 * API Domains Index
 * Centralized export for all API domains
 */

import authAPI from "./auth";
import categoriesAPI from "./categories";
import requestsAPI from "./requests";
import quotesAPI from "./quotes";
import freelancersAPI from "./freelancers";
import usersAPI from "./users";
import jobsAPI from "./jobs";
import messagesAPI from "./messages";
import notificationsAPI from "./notifications";
import paymentsAPI from "./payments";
import reviewsAPI from "./reviews";
import reportsAPI from "./reports";
import complaintsAPI from "./complaints";
import progressAPI from "./progress";
import statisticsAPI from "./statistics";

export {
  authAPI,
  categoriesAPI,
  requestsAPI,
  quotesAPI,
  freelancersAPI,
  usersAPI,
  jobsAPI,
  messagesAPI,
  notificationsAPI,
  paymentsAPI,
  reviewsAPI,
  reportsAPI,
  complaintsAPI,
  progressAPI,
  statisticsAPI,
};

export const domains = {
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
