import { useState, useEffect } from 'react';
import {
  FaUniversity,
  FaMobileAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaCreditCard
} from 'react-icons/fa';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import './AccountDetails.css';

const ACCOUNT_TYPE_LABELS = {
  bank: 'Bank Account',
  jazzcash: 'JazzCash',
  easypaisa: 'Easypaisa',
  other: 'Other'
};

const ACCOUNT_TYPE_ICONS = {
  bank: <FaUniversity />,
  jazzcash: <FaMobileAlt />,
  easypaisa: <FaMobileAlt />,
  other: <FaCreditCard />
};

const emptyForm = {
  accountHolderName: '',
  bankName: '',
  accountNumber: '',
  iban: '',
  accountType: 'bank',
  instructions: ''
};

const AccountDetails = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [success, setSuccess] = useState('');

  const token = localStorage.getItem('adminToken');
  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.ACCOUNT_DETAILS.GET_ALL, { headers: authHeaders });
      const data = await res.json();
      if (data.success) setAccounts(data.accounts);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAccounts(); }, []);
  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(''), 3000); return () => clearTimeout(t); }
  }, [success]);

  const openAddForm = () => {
    setForm(emptyForm); setEditingId(null); setSubmitted(false); setShowForm(true);
  };

  const openEditForm = (account) => {
    setForm({
      accountHolderName: account.accountHolderName,
      bankName: account.bankName,
      accountNumber: account.accountNumber,
      iban: account.iban || '',
      accountType: account.accountType,
      instructions: account.instructions || ''
    });
    setEditingId(account._id); setSubmitted(false); setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false); setEditingId(null); setForm(emptyForm); setSubmitted(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const isInvalid = (field) => submitted && !form[field].trim();

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (!form.accountHolderName.trim() || !form.bankName.trim() || !form.accountNumber.trim()) return;

    setSaving(true);
    try {
      const url = editingId
        ? API_ENDPOINTS.ACCOUNT_DETAILS.UPDATE(editingId)
        : API_ENDPOINTS.ACCOUNT_DETAILS.CREATE;
      const method = editingId ? 'PUT' : 'POST';

      // use accountHolderName as accountTitle too (backend requires it)
      const payload = {
        ...form,
        accountTitle: form.accountHolderName,
        isActive: true
      };

      const res = await fetch(url, { method, headers: authHeaders, body: JSON.stringify(payload) });
      const data = await res.json();
      if (data.success) {
        setSuccess(editingId ? 'Account updated!' : 'Account added!');
        closeForm();
        fetchAccounts();
      }
    } catch { /* silent */ } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this account?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(API_ENDPOINTS.ACCOUNT_DETAILS.DELETE(id), {
        method: 'DELETE', headers: authHeaders
      });
      const data = await res.json();
      if (data.success) { setSuccess('Account deleted!'); fetchAccounts(); }
    } catch { /* silent */ } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="account-details-container">
      {/* Header */}
      <div className="account-details-header">
        <div className="account-details-title">
          <FaUniversity className="header-icon" />
          <div>
            <h2>Account Details</h2>
            <p>Manage bank &amp; payment accounts shown to users on the mobile app</p>
          </div>
        </div>
        <button className="btn-add-account" onClick={openAddForm}>
          <FaPlus /> Add Account
        </button>
      </div>

      {success && <div className="toast-success"><FaSave /> {success}</div>}

      {/* Modal */}
      {showForm && (
        <div className="account-modal-overlay" onClick={closeForm}>
          <div className="account-modal" onClick={(e) => e.stopPropagation()}>
            <div className="account-modal-header">
              <h3>{editingId ? 'Edit Account' : 'Add New Account'}</h3>
              <button className="modal-close-btn" onClick={closeForm}><FaTimes /></button>
            </div>

            <form className="account-form" onSubmit={handleSave}>
              {/* Account Type */}
              <div className="form-group">
                <label>Account Type</label>
                <div className="type-selector">
                  {Object.entries(ACCOUNT_TYPE_LABELS).map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      className={`type-btn ${form.accountType === val ? 'active' : ''}`}
                      onClick={() => setForm((p) => ({ ...p, accountType: val }))}
                    >
                      {ACCOUNT_TYPE_ICONS[val]} {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3 required fields */}
              <div className="form-group">
                <label>Account Holder Name</label>
                <input
                  type="text"
                  name="accountHolderName"
                  value={form.accountHolderName}
                  onChange={handleChange}
                  placeholder="Full name on account"
                  className={isInvalid('accountHolderName') ? 'input-error' : ''}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Bank / Service Name</label>
                  <input
                    type="text"
                    name="bankName"
                    value={form.bankName}
                    onChange={handleChange}
                    placeholder="e.g. JazzCash, HBL"
                    className={isInvalid('bankName') ? 'input-error' : ''}
                  />
                </div>
                <div className="form-group">
                  <label>Account Number</label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={form.accountNumber}
                    onChange={handleChange}
                    placeholder="e.g. 03001234567"
                    className={isInvalid('accountNumber') ? 'input-error' : ''}
                  />
                </div>
              </div>

              {/* Optional fields */}
              <div className="form-group">
                <label>IBAN <span className="optional">(optional)</span></label>
                <input
                  type="text"
                  name="iban"
                  value={form.iban}
                  onChange={handleChange}
                  placeholder="e.g. PK36SCBL0000001123456702"
                />
              </div>

              <div className="form-group">
                <label>Instructions <span className="optional">(optional)</span></label>
                <textarea
                  name="instructions"
                  value={form.instructions}
                  onChange={handleChange}
                  rows={3}
                  placeholder="e.g. Send payment screenshot after transfer..."
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={closeForm}>
                  <FaTimes /> Cancel
                </button>
                <button type="submit" className="btn-save" disabled={saving}>
                  <FaSave /> {saving ? 'Saving...' : editingId ? 'Update Account' : 'Add Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Accounts List */}
      {loading ? (
        <div className="accounts-loading">
          <div className="loading-spinner" />
          <p>Loading accounts...</p>
        </div>
      ) : accounts.length === 0 ? (
        <div className="accounts-empty">
          <FaUniversity className="empty-icon" />
          <h3>No accounts added yet</h3>
          <p>Click "Add Account" to add your first bank or payment account.</p>
        </div>
      ) : (
        <div className="accounts-grid">
          {accounts.map((account) => (
            <div key={account._id} className="account-card">
              <div className="account-card-header">
                <div className="account-type-badge">
                  {ACCOUNT_TYPE_ICONS[account.accountType]}
                  <span>{ACCOUNT_TYPE_LABELS[account.accountType]}</span>
                </div>
                <div className="account-card-actions">
                  <button className="btn-edit" onClick={() => openEditForm(account)} title="Edit">
                    <FaEdit />
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(account._id)}
                    disabled={deletingId === account._id}
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className="account-card-body">
                <h3 className="account-title">{account.accountHolderName}</h3>
                <p className="account-bank">{account.bankName}</p>

                <div className="account-info-row">
                  <span className="info-label">Account Number</span>
                  <span className="info-value account-number">{account.accountNumber}</span>
                </div>
                {account.iban && (
                  <div className="account-info-row">
                    <span className="info-label">IBAN</span>
                    <span className="info-value account-number">{account.iban}</span>
                  </div>
                )}
                {account.instructions && (
                  <div className="account-instructions">
                    <p>{account.instructions}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountDetails;
