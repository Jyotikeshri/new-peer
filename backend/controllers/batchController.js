import User from '../models/User.js';
import Review from '../models/Review.js';
import Badge from '../models/Badge.js';
// import Group from '../models/StudyGroup.js'; // Uncomment if needed

async function assignBadgesBatch() {
  try {
    const users = await User.find(); // Get all users

    for (let user of users) {
      let badgesAwarded = [];

      // 1. Badge for reviews: If the user has more than 15 reviews
      const reviewCount = await Review.countDocuments({ reviewee: user._id });
      console.log(`User ${user.username} has ${reviewCount} reviews`);

      if (reviewCount > 15) {
        // Check if the badge already exists
        const existingBadge = await Badge.findOne({ user: user._id, badgeType: 'Top Reviewer' });
        if (!existingBadge) {
          await Badge.create({
            user: user._id,
            badgeType: 'Top Reviewer',
            description: 'Awarded for having more than 15 reviews.',
          });
          badgesAwarded.push('Top Reviewer');
          console.log(`Badge "Top Reviewer" awarded to ${user.username}`);
        } else {
          console.log(`User ${user.username} already has the "Top Reviewer" badge.`);
        }
      }

      // 2. Badge for rating: If the user’s average rating is greater than 4.5
      const reviews = await Review.find({ reviewee: user._id });
      const totalRatings = reviews.reduce((acc, review) => {
        acc.collaboration += review.ratings.collaboration;
        acc.skill += review.ratings.skill;
        acc.communication += review.ratings.communication || 0;
        acc.teamwork += review.ratings.teamwork || 0;
        acc.punctuality += review.ratings.punctuality || 0;
        return acc;
      }, { collaboration: 0, skill: 0, communication: 0, teamwork: 0, punctuality: 0 });

      const totalReviews = reviews.length;
      const averageRating = (totalRatings.collaboration + totalRatings.skill + totalRatings.communication + totalRatings.teamwork + totalRatings.punctuality) / (5 * totalReviews);
      
      console.log(`User ${user.username} has an average rating of ${averageRating}`);
      if (averageRating > 4.5) {
        // Check if the badge already exists
        const existingBadge = await Badge.findOne({ user: user._id, badgeType: 'High Rated' });
        if (!existingBadge) {
          await Badge.create({
            user: user._id,
            badgeType: 'High Rated',
            description: 'Awarded for having an average rating higher than 4.5.',
          });
          badgesAwarded.push('High Rated');
          console.log(`Badge "High Rated" awarded to ${user.username}`);
        } else {
          console.log(`User ${user.username} already has the "High Rated" badge.`);
        }
      }

      // 3. Badge for friends: If the user has more than 15 friends
      if (user?.friends?.length > 15) {
        // Check if the badge already exists
        const existingBadge = await Badge.findOne({ user: user._id, badgeType: 'Social Butterfly' });
        if (!existingBadge) {
          await Badge.create({
            user: user._id,
            badgeType: 'Social Butterfly',
            description: 'Awarded for having more than 15 friends.',
          });
          badgesAwarded.push('Social Butterfly');
          console.log(`Badge "Social Butterfly" awarded to ${user.username}`);
        } else {
          console.log(`User ${user.username} already has the "Social Butterfly" badge.`);
        }
      }

      // 4. Badge for group activity: If the user has spent more than 1000 minutes in group study
      // Uncomment the following lines once Group model is available
      // const groups = await Group.find({ members: user._id });
      // let totalTimeSpent = 0;

      // groups.forEach(group => {
      //   totalTimeSpent += group.studyTime || 0;
      // });

      // if (totalTimeSpent > 1000) {
      //   // Check if the badge already exists
      //   const existingBadge = await Badge.findOne({ user: user._id, badgeType: 'Study Master' });
      //   if (!existingBadge) {
      //     await Badge.create({
      //       user: user._id,
      //       badgeType: 'Study Master',
      //       description: 'Awarded for spending more than 1000 minutes in study groups.',
      //     });
      //     badgesAwarded.push('Study Master');
      //     console.log(`Badge "Study Master" awarded to ${user.username}`);
      //   } else {
      //     console.log(`User ${user.username} already has the "Study Master" badge.`);
      //   }
      // }

      if (badgesAwarded.length > 0) {
        console.log(`Badges awarded to ${user.username}: ${badgesAwarded.join(', ')}`);
      }
    }

    return 'Batch process completed successfully!';
  } catch (error) {
    console.error('Error during batch badge assignment:', error);
    throw error;
  }
}

export { assignBadgesBatch };
