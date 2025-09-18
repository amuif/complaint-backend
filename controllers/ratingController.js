const { Rating, Employee } = require('../models');

// Create rating
const createRating = async (req, res) => {
  try {
    const {
      phone_number,
      courtesy,
      timeliness,
      knowledge,
      overall_experience,
      suggestions,
      sector_id,
      division_id,
      department_id,
      team_id,
      employee_id,
    } = req.body;
    console.log(req.body);

    if (!employee_id || !phone_number || !courtesy || !timeliness || !knowledge) {
      return res.status(400).json({
        message: 'Employee ID, phone number, courtesy, timeliness, and knowledge are required',
      });
    }

    if (
      ![1, 2, 3, 4, 5].includes(Number(courtesy)) ||
      ![1, 2, 3, 4, 5].includes(Number(timeliness)) ||
      ![1, 2, 3, 4, 5].includes(Number(knowledge))
    ) {
      return res.status(400).json({
        message: 'Courtesy, timeliness, and knowledge must be between 1 and 5',
      });
    }

    const employee = await Employee.findByPk(employee_id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const ratingData = {
      employee_id: parseInt(employee_id),
      phone_number,
      courtesy: parseInt(courtesy),
      timeliness: parseInt(timeliness),
      knowledge: parseInt(knowledge),
      overall_experience,
      suggestions,
      rating_source: 'rating',
      sector_id,
      division_id,
      department_id,
      team_id,
    };

    const rating = await Rating.create(ratingData);

    res.status(201).json({
      message: 'Rating submitted successfully',
      rating: {
        id: rating.id,
        employee_id: rating.employee_id,
        phone_number: rating.phone_number,
        courtesy: rating.courtesy,
        timeliness: rating.timeliness,
        knowledge: rating.knowledge,
        overall_experience: rating.overall_experience,
        suggestions: rating.suggestions,
        created_at: rating.created_at,
      },
    });
  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({ message: 'Error submitting rating', error: error.message });
  }
};

module.exports = {
  createRating,
};
