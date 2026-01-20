// Backend\models\Template.js
const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Template name is required'],
    trim: true,
    maxlength: [100, 'Template name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  liveDemo: {
    type: String,
    trim: true
  },
  templateLink: {
    type: String,
    trim: true
  },
  previewImage: {
    type: String,
    required: false
  },
  category: {
    type: String,
    enum: ['portfolio', 'ecommerce', 'blog', 'business', 'other'],
    default: 'other'
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  
  // ✅ NEW: Backend support fields
  withBackend: {
    type: Boolean,
    default: false
  },
  creditsRequired: {
    type: Number,
    default: 1,
    min: [1, 'Credits required must be at least 1']
  },

  // What's Included Section
  whatsIncluded: {
    title: {
      type: String,
      default: "What's Included"
    },
    items: [{
      text: String,
      included: {
        type: Boolean,
        default: true
      }
    }],
    customItems: [{
      text: String,
      included: {
        type: Boolean,
        default: true
      }
    }]
  },

  // Template Info Section
  templateInfo: {
    title: {
      type: String,
      default: 'Template Information'
    },
    details: [{
      label: String,
      value: String
    }]
  },

  // Development Process Section
  developmentProcess: {
    title: String,
    steps: [{
      stepNumber: Number,
      title: String,
      description: String
    }]
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// ✅ NEW: Pre-save hook to auto-set creditsRequired based on withBackend
templateSchema.pre('save', function(next) {
  if (this.withBackend) {
    this.creditsRequired = 4;
  } else {
    this.creditsRequired = 1;
  }
  next();
});

// ✅ NEW: Pre-update hook for findOneAndUpdate
templateSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  
  // Handle both direct update and $set update
  const withBackend = update.withBackend !== undefined 
    ? update.withBackend 
    : (update.$set && update.$set.withBackend !== undefined ? update.$set.withBackend : null);
  
  if (withBackend !== null) {
    if (update.$set) {
      update.$set.creditsRequired = withBackend ? 4 : 1;
    } else {
      update.creditsRequired = withBackend ? 4 : 1;
    }
  }
  
  next();
});

// Index for better search performance
templateSchema.index({ name: 'text', description: 'text' });
templateSchema.index({ isActive: 1 });
templateSchema.index({ category: 1 });
templateSchema.index({ withBackend: 1 }); // ✅ NEW: Index for backend filter

module.exports = mongoose.model('Template', templateSchema);
