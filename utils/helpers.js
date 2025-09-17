const { Rating } = require('../models');

// Clean up ratings with null employee_id
const cleanUpRatings = async () => {
  try {
    await Rating.destroy({ where: { employee_id: null } });
    // Deleted ratings with null employee_id
  } catch (error) {
    // Cleanup failed, continue silently in production
  }
};

// Language validation helper
const validateLanguage = (lang) => {
  return ['en', 'am', 'af'].includes(lang);
};

// Generate sentiment analysis from rating
const getSentiment = (rating) => {
  if (!rating) return 'neutral';
  if (rating >= 4) return 'positive';
  if (rating <= 2) return 'negative';
  return 'neutral';
};

// Add profile picture URL helper
const addProfilePictureUrl = (entity) => {
  const plainEntity = entity.get
    ? entity.get({ plain: true })
    : entity.toJSON
      ? entity.toJSON()
      : entity;
  return {
    ...plainEntity,
    profile_picture: entity.profile_picture
      ? `/Uploads/profile_pictures/${entity.profile_picture}`
      : null,
  };
};

// Add voice file URL helper
const addVoiceFileUrl = (complaint) => {
  return {
    ...complaint.get({ plain: true }),
    voice_url: complaint.voice_file ? `/uploads/voice_complaints/${complaint.voice_file}` : null,
  };
};

module.exports = {
  cleanUpRatings,
  validateLanguage,
  getSentiment,
  addProfilePictureUrl,
  addVoiceFileUrl,
};
