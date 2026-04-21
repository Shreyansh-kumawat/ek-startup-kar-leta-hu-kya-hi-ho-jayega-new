const cron = require('node-cron');
const WebsiteBooking = require('../models/WebsiteBooking');

// ✅ CRON JOB: Runs every 1 minute (for testing) or 54 minutes (production)
const startProgressUpdater = () => {
  // console.log('  Progress Auto-Updater Started!');
  
  // ✅ TESTING: Every 1 minute
  cron.schedule('*/54 * * * *', async () => {
    try {
      // console.log('⏰ Running progress update job at:', new Date().toLocaleTimeString());
      
      // ✅ FIX: Use correct status names (no underscores!)
      const bookings = await WebsiteBooking.find({
        status: { $in: ['approved', 'inprogress'] },  // ✅ FIXED!
        progress: { $lt: 90 },
        approvedAt: { $exists: true, $ne: null }
      });
      
      // console.log(`📊 Found ${bookings.length} booking(s) to check`);
      
      if (bookings.length === 0) {
        // console.log('✅ No bookings need progress update');
        return;
      }
      
      let updatedCount = 0;
      
      for (const booking of bookings) {
        const now = new Date();
        const approvedAt = new Date(booking.approvedAt);
        
        // Calculate elapsed time in minutes
        const elapsedMinutes = Math.floor((now - approvedAt) / (1000 * 60));
        
        // ✅ TESTING: 1% per minute (change to 54 for production)
        let newProgress = 10 + Math.floor(elapsedMinutes / 1); // 1 min per 1%
        
        // Cap at 90%
        if (newProgress > 90) {
          newProgress = 90;
        }
        
        // Only update if progress changed
        if (newProgress !== booking.progress) {
          const oldProgress = booking.progress;
          booking.progress = newProgress;
          
          // Change status to 'inprogress' if still 'approved'
          if (booking.status === 'approved' && newProgress > 10) {
            booking.status = 'inprogress';
          }
          
          // ✅ FIX: Change to 'readyforcompletion' when reaches 90%
          if (newProgress === 90) {
            booking.status = 'readyforcompletion';  // ✅ FIXED!
          }
          
          await booking.save();
          updatedCount++;
          
          // console.log(`✅ Updated ${booking.bookingId}: ${oldProgress}% → ${newProgress}% (${elapsedMinutes} min elapsed)`);
        }
      }
      
      if (updatedCount > 0) {
        // console.log(`🎉 Progress update completed! Updated ${updatedCount} booking(s)`);
      } else {
        // console.log('ℹ️  No progress changes needed');
      }
      
    } catch (error) {
      console.error('❌ Progress update job error:', error);
    }
  });
  
  // console.log('⏱️  Cron schedule: Every 1 minute (TESTING MODE)');
  // console.log('📈 Progress: 10% → 90% (1% per minute for testing)');
  // console.log('🎯 Production: Change to */54 minutes (54 min per 1%)');
};

module.exports = { startProgressUpdater };
