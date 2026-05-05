// Mock data exports
import categories from './categories.json';
import requests from './requests.json';
import freelancers from './freelancers.json';
import quotes from './quotes.json';
import jobs from './jobs.json';
import users from './users.json';
import notifications from './notifications.json';
import messages from './messages.json';
import conversations from './conversations.json';
import payments from './payments.json';
import reviews from './reviews.json';
import reports from './reports.json';
import complaints from './complaints.json';
import statistics from './statistics.json';

export {
  categories,
  requests,
  freelancers,
  quotes,
  jobs,
  users,
  notifications,
  messages,
  conversations,
  payments,
  reviews,
  reports,
  complaints,
  statistics
};

// Helper functions
export const getRequestById = (id) => {
  return requests.find(req => req.id === parseInt(id));
};

export const getFreelancerById = (id) => {
  return freelancers.find(fl => fl.id === parseInt(id));
};

export const getUserById = (id) => {
  return users.find(user => user.id === parseInt(id));
};

export const getJobById = (id) => {
  return jobs.find(job => job.id === parseInt(id));
};

export const getQuotesByRequestId = (requestId) => {
  return quotes.filter(quote => quote.requestId === parseInt(requestId));
};

export const getRequestsByCategory = (categoryId) => {
  return requests.filter(req => req.categoryId === parseInt(categoryId));
};

export const getRequestsByStatus = (status) => {
  return requests.filter(req => req.status === status);
};

export const getJobsByFreelancerId = (freelancerId) => {
  return jobs.filter(job => job.freelancerId === parseInt(freelancerId));
};

export const getJobsByEmployerId = (employerId) => {
  return jobs.filter(job => job.employerId === parseInt(employerId));
};

export const getNotificationsByUserId = (userId) => {
  return notifications.filter(notif => notif.userId === parseInt(userId));
};

export const getUnreadNotificationsCount = (userId) => {
  return notifications.filter(notif => notif.userId === parseInt(userId) && !notif.read).length;
};

// Conversation helpers
export const getConversationsByUserId = (userId) => {
  return conversations.filter(conv => 
    conv.participant1.id === parseInt(userId) || 
    conv.participant2.id === parseInt(userId)
  );
};

export const getMessagesByConversationId = (conversationId) => {
  return messages.filter(msg => msg.conversationId === parseInt(conversationId));
};

// Payment helpers
export const getPaymentsByJobId = (jobId) => {
  return payments.filter(payment => payment.jobId === parseInt(jobId));
};

export const getPaymentsByUserId = (userId) => {
  return payments.filter(payment => payment.payerId === parseInt(userId));
};

// Review helpers
export const getReviewsByJobId = (jobId) => {
  return reviews.filter(review => review.jobId === parseInt(jobId));
};

export const getReviewsByFreelancerId = (freelancerId) => {
  return reviews.filter(review => review.reviewedId === parseInt(freelancerId) && review.type === 'NGUOI_THUE_DANH_GIA_FREELANCER');
};

export const getReviewsByEmployerId = (employerId) => {
  return reviews.filter(review => review.reviewedId === parseInt(employerId) && review.type === 'FREELANCER_DANH_GIA_NGUOI_THUE');
};

// Report & Complaint helpers
export const getReportsByStatus = (status) => {
  return reports.filter(report => report.status === status);
};

export const getComplaintsByStatus = (status) => {
  return complaints.filter(complaint => complaint.status === status);
};

// Search and filter functions
export const searchRequests = (keyword, filters = {}) => {
  let results = [...requests];

  // Search by keyword
  if (keyword) {
    const lowerKeyword = keyword.toLowerCase();
    results = results.filter(req => 
      req.title.toLowerCase().includes(lowerKeyword) ||
      req.description.toLowerCase().includes(lowerKeyword) ||
      req.skills.some(skill => skill.toLowerCase().includes(lowerKeyword))
    );
  }

  // Filter by category
  if (filters.categoryId) {
    results = results.filter(req => req.categoryId === parseInt(filters.categoryId));
  }

  // Filter by status
  if (filters.status) {
    results = results.filter(req => req.status === filters.status);
  }

  // Filter by budget range
  if (filters.minBudget) {
    results = results.filter(req => req.budgetMax >= parseInt(filters.minBudget));
  }
  if (filters.maxBudget) {
    results = results.filter(req => req.budgetMin <= parseInt(filters.maxBudget));
  }

  // Filter by location
  if (filters.location) {
    results = results.filter(req => req.location.toLowerCase().includes(filters.location.toLowerCase()));
  }

  return results;
};

export const searchFreelancers = (keyword, filters = {}) => {
  let results = [...freelancers];

  // Search by keyword
  if (keyword) {
    const lowerKeyword = keyword.toLowerCase();
    results = results.filter(fl => 
      fl.name.toLowerCase().includes(lowerKeyword) ||
      fl.bio.toLowerCase().includes(lowerKeyword) ||
      fl.skills.some(skill => skill.toLowerCase().includes(lowerKeyword))
    );
  }

  // Filter by skills
  if (filters.skills && filters.skills.length > 0) {
    results = results.filter(fl => 
      filters.skills.some(skill => 
        fl.skills.some(flSkill => flSkill.toLowerCase().includes(skill.toLowerCase()))
      )
    );
  }

  // Filter by rating
  if (filters.minRating) {
    results = results.filter(fl => fl.rating >= parseFloat(filters.minRating));
  }

  // Sort by rating
  if (filters.sortBy === 'rating') {
    results.sort((a, b) => b.rating - a.rating);
  }

  // Sort by completed projects
  if (filters.sortBy === 'projects') {
    results.sort((a, b) => b.completedProjects - a.completedProjects);
  }

  return results;
};

export default {
  categories,
  requests,
  freelancers,
  quotes,
  jobs,
  users,
  notifications,
  messages,
  conversations,
  payments,
  reviews,
  reports,
  complaints,
  statistics,
  // Helper functions
  getRequestById,
  getFreelancerById,
  getUserById,
  getJobById,
  getQuotesByRequestId,
  getRequestsByCategory,
  getRequestsByStatus,
  getJobsByFreelancerId,
  getJobsByEmployerId,
  getNotificationsByUserId,
  getUnreadNotificationsCount,
  getConversationsByUserId,
  getMessagesByConversationId,
  getPaymentsByJobId,
  getPaymentsByUserId,
  getReviewsByJobId,
  getReviewsByFreelancerId,
  getReviewsByEmployerId,
  getReportsByStatus,
  getComplaintsByStatus,
  searchRequests,
  searchFreelancers
};
