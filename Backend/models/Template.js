const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // ✅ This already creates index, so removed duplicate index below
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  previewImage: {
    type: String, // Single compressed image URL
    default: ''
  },
  // templateLink: {
  //   type: String, // External link to hosted template
  //   required: false,
  //   default: ''
  // },
  liveDemo: {
    type: String, // Live demo URL
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  backend: {
  type: Boolean,
  default: false
},

  
  // CUSTOMIZABLE SECTIONS
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

  templateInfo: {
    title: {
      type: String,
      default: "Template Information"
    },
    details: [{
      label: String,
      value: String
    }]
  },

  developmentProcess: {
    title: {
      type: String,
      default: "Development Process"
    },
    steps: [{
      step: Number,
      title: String,
      description: String,
      timeline: String
    }]
  },

  // Basic fields
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// ✅ FIXED: Removed duplicate name index (already created by unique: true)
// templateSchema.index({ name: 1 }); // ← REMOVED this line
templateSchema.index({ isActive: 1 });
templateSchema.index({ createdAt: -1 });

const Template = mongoose.model('Template', templateSchema);

module.exports = Template;
