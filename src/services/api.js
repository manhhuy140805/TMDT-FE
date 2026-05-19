/**
 * API Service - Main Export
 * Base URL: http://localhost:8080
 */

import authService from "./authService";
import userService from "./userService";
import categoryService from "./categoryService";
import skillService from "./skillService";
import jobService from "./jobService";
import proposalService from "./proposalService";
import freelancerService from "./freelancerService";
import contractService from "./contractService";
import supervisorService from "./supervisorService";
import progressService from "./progressService";
import chatService from "./chatService";
import disputeService from "./disputeService";
import evidenceService from "./evidenceService";
import notificationService from "./notificationService";
import paymentService from "./paymentService";
import reviewService from "./reviewService";
import reportService from "./reportService";
import adminService from "./adminService";

const api = {
  auth: authService,
  users: userService,
  categories: categoryService,
  skills: skillService,
  jobs: jobService,
  requests: jobService,          // alias → jobService
  proposals: proposalService,
  quotes: proposalService,       // alias → proposalService
  freelancers: freelancerService,
  contracts: contractService,
  supervisors: supervisorService,
  progress: progressService,
  chat: chatService,
  messages: chatService,         // alias → chatService
  disputes: disputeService,
  evidences: evidenceService,
  notifications: notificationService,
  payments: paymentService,
  reviews: reviewService,
  reports: reportService,
  admin: adminService,
};

export default api;
