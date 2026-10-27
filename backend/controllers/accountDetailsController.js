import AccountDetails from '../models/AccountDetails.js';
import { getCache, setCache, deleteCache } from '../config/redis.js';

const CACHE_KEY = 'account_details_all';
const PUBLIC_CACHE_KEY = 'account_details_public';

// ─── Admin: Get all account details (including inactive) ─────────────────────
export const getAllAccountDetails = async (req, res) => {
  try {
    const accounts = await AccountDetails.find()
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();
    res.json({ success: true, accounts });
  } catch (error) {
    console.error('Error fetching account details:', error);
    res.status(500).json({ success: false, message: 'Error fetching account details', error: error.message });
  }
};

// ─── Public: Get active account details (for mobile app) ─────────────────────
export const getPublicAccountDetails = async (req, res) => {
  try {
    const cached = await getCache(PUBLIC_CACHE_KEY);
    if (cached) return res.json({ success: true, accounts: cached, fromCache: true });

    const accounts = await AccountDetails.find({ isActive: true })
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();

    await setCache(PUBLIC_CACHE_KEY, accounts, 120); // cache 2 minutes
    res.json({ success: true, accounts });
  } catch (error) {
    console.error('Error fetching public account details:', error);
    res.status(500).json({ success: false, message: 'Error fetching account details', error: error.message });
  }
};

// ─── Admin: Create account detail ────────────────────────────────────────────
export const createAccountDetail = async (req, res) => {
  try {
    const { accountTitle, bankName, accountHolderName, accountNumber, iban, accountType, instructions, isActive, displayOrder } = req.body;

    if (!accountTitle || !accountTitle.trim()) {
      return res.status(400).json({ success: false, message: 'Account title is required' });
    }
    if (!bankName || !bankName.trim()) {
      return res.status(400).json({ success: false, message: 'Bank / service name is required' });
    }
    if (!accountHolderName || !accountHolderName.trim()) {
      return res.status(400).json({ success: false, message: 'Account holder name is required' });
    }
    if (!accountNumber || !accountNumber.trim()) {
      return res.status(400).json({ success: false, message: 'Account number is required' });
    }

    const account = new AccountDetails({
      accountTitle: accountTitle.trim(),
      bankName: bankName.trim(),
      accountHolderName: accountHolderName.trim(),
      accountNumber: accountNumber.trim(),
      iban: iban ? iban.trim() : '',
      accountType: accountType || 'bank',
      instructions: instructions ? instructions.trim() : '',
      isActive: isActive !== undefined ? isActive : true,
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : 0
    });

    await account.save();
    await deleteCache(PUBLIC_CACHE_KEY);

    res.status(201).json({ success: true, message: 'Account detail created successfully', account });
  } catch (error) {
    console.error('Error creating account detail:', error);
    res.status(500).json({ success: false, message: 'Error creating account detail', error: error.message });
  }
};

// ─── Admin: Update account detail ────────────────────────────────────────────
export const updateAccountDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const { accountTitle, bankName, accountHolderName, accountNumber, iban, accountType, instructions, isActive, displayOrder } = req.body;

    const account = await AccountDetails.findById(id);
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account detail not found' });
    }

    if (accountTitle !== undefined) account.accountTitle = accountTitle.trim();
    if (bankName !== undefined) account.bankName = bankName.trim();
    if (accountHolderName !== undefined) account.accountHolderName = accountHolderName.trim();
    if (accountNumber !== undefined) account.accountNumber = accountNumber.trim();
    if (iban !== undefined) account.iban = iban.trim();
    if (accountType !== undefined) account.accountType = accountType;
    if (instructions !== undefined) account.instructions = instructions.trim();
    if (isActive !== undefined) account.isActive = isActive;
    if (displayOrder !== undefined) account.displayOrder = Number(displayOrder);

    await account.save();
    await deleteCache(PUBLIC_CACHE_KEY);

    res.json({ success: true, message: 'Account detail updated successfully', account });
  } catch (error) {
    console.error('Error updating account detail:', error);
    res.status(500).json({ success: false, message: 'Error updating account detail', error: error.message });
  }
};

// ─── Admin: Delete account detail ────────────────────────────────────────────
export const deleteAccountDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const account = await AccountDetails.findByIdAndDelete(id);
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account detail not found' });
    }

    await deleteCache(PUBLIC_CACHE_KEY);

    res.json({ success: true, message: 'Account detail deleted successfully' });
  } catch (error) {
    console.error('Error deleting account detail:', error);
    res.status(500).json({ success: false, message: 'Error deleting account detail', error: error.message });
  }
};
