import FraudReport from '../models/FraudReport.js';

// POST /api/fraud/report - Public
export const submitFraudReport = async (req, res) => {
  try {
    const { reporterName, reporterPhone, scammerPhone, message, screenshot, screenshotName } = req.body;

    if (!reporterName || !reporterPhone || !scammerPhone || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const report = await FraudReport.create({
      reporterName: reporterName.trim(),
      reporterPhone: reporterPhone.trim(),
      scammerPhone: scammerPhone.trim(),
      message: message.trim(),
      screenshot: screenshot || null,
      screenshotName: screenshotName || null
    });

    return res.status(201).json({
      success: true,
      message: 'Fraud report submitted successfully. Our team will review it shortly.',
      reportId: report._id
    });
  } catch (error) {
    console.error('Submit fraud report error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// GET /api/fraud/reports - Admin only
export const getAllFraudReports = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status && status !== 'all' ? { status } : {};

    const reports = await FraudReport.find(filter).sort({ createdAt: -1 }).lean();

    const counts = {
      all: await FraudReport.countDocuments(),
      pending: await FraudReport.countDocuments({ status: 'pending' }),
      reviewed: await FraudReport.countDocuments({ status: 'reviewed' }),
      actioned: await FraudReport.countDocuments({ status: 'actioned' })
    };

    return res.status(200).json({ success: true, reports, counts });
  } catch (error) {
    console.error('Get fraud reports error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// PUT /api/fraud/report/:id - Admin only
export const updateFraudReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    const report = await FraudReport.findByIdAndUpdate(
      id,
      { status, adminNote },
      { new: true }
    );

    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    return res.status(200).json({ success: true, message: 'Report updated', report });
  } catch (error) {
    console.error('Update fraud report error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// DELETE /api/fraud/report/:id - Admin only
export const deleteFraudReport = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await FraudReport.findByIdAndDelete(id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    return res.status(200).json({ success: true, message: 'Report deleted' });
  } catch (error) {
    console.error('Delete fraud report error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
