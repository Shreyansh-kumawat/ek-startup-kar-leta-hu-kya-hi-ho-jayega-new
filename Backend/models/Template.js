const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  previewImage: {
    type: String,
    default: ''
  },
  liveDemo: {
    type: String,
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

// ✅ VIRTUAL FIELD: displayId (last 6 chars)
templateSchema.virtual('displayId').get(function() {
  const last6 = this._id.toString().slice(-6);
  return `#3di-${last6}`;
});

// ✅ ENABLE VIRTUALS IN JSON/OBJECT OUTPUT
templateSchema.set('toJSON', { virtuals: true });
templateSchema.set('toObject', { virtuals: true });

templateSchema.index({ isActive: 1 });
templateSchema.index({ createdAt: -1 });

const Template = mongoose.model('Template', templateSchema);

module.exports = Template;
