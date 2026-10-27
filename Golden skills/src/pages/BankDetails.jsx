import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/apiConfig';
import './BankDetails.css';
import {
  FaUniversity,
  FaMobileAlt,
  FaCreditCard,
  FaCopy,
  FaCheckCircle,
  FaSpinner
} from 'react-icons/fa';

const ACCOUNT_TYPE_ICONS = {
  bank: <FaUniversity />,
  jazzcash: <FaMobileAlt />,
  easypaisa: <FaMobileAlt />,
  other: <FaCreditCard />
};

const ACCOUNT_TYPE_LABELS = {
  bank: 'Bank Account',
  jazzcash: 'JazzCash',
  easypaisa: 'Easypaisa',
  other: 'Other'
};

const TYPE_COLORS = {
  bank: '#1a56db',
  jazzcash: '#c0392b',
  easypaisa: '#27ae60',
  other: '#7f8c8d'
};

const BankDetails = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.ACCOUNT_DETAILS.GET_PUBLIC);
      const data = await res.json();
      if (data.success) {
        setAccounts(data.accounts || []);
      } else {
        setError('Could not load payment details.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="bank-details-page">
      {/* Header */}
      <div className="bank-page-header">
        <div className="bank-header-icon">
          <FaUniversity />
        </div>
        <h1>Payment Details</h1>
        <p>Send your payment to any of the accounts below and share the screenshot as proof.</p>
      </div>

      {/* Content */}
      <div className="bank-page-content">
        {loading ? (
          <div className="bank-loading">
            <FaSpinner className="spin-icon" />
            <p>Loading payment details...</p>
          </div>
        ) : error ? (
          <div className="bank-error">
            <p>{error}</p>
            <button onClick={fetchAccounts}>Try Again</button>
          </div>
        ) : accounts.length === 0 ? (
          <div className="bank-empty">
            <FaUniversity />
            <p>No payment details available at the moment.</p>
          </div>
        ) : (
          <div className="bank-cards-list">
            {accounts.map((account) => (
              <div
                key={account._id}
                className="bank-card"
                style={{ '--accent': TYPE_COLORS[account.accountType] || '#390910' }}
              >
                {/* Card Top */}
                <div className="bank-card-top">
                  <div className="bank-card-type">
                    <span className="type-icon">
                      {ACCOUNT_TYPE_ICONS[account.accountType]}
                    </span>
                    <span className="type-label">
                      {ACCOUNT_TYPE_LABELS[account.accountType]}
                    </span>
                  </div>
                  <span className="bank-name-tag">{account.bankName}</span>
                </div>

                {/* Card Title */}
                <h3 className="bank-card-title">{account.accountTitle}</h3>

                {/* Account Info */}
                <div className="bank-info-list">
                  <div className="bank-info-row">
                    <span className="bank-info-label">Account Holder</span>
                    <span className="bank-info-value">{account.accountHolderName}</span>
                  </div>

                  <div className="bank-info-row">
                    <span className="bank-info-label">Account Number</span>
                    <div className="bank-info-copy">
                      <span className="bank-info-value mono">{account.accountNumber}</span>
                      <button
                        className="copy-btn"
                        onClick={() => copyToClipboard(account.accountNumber, account._id + '-num')}
                        title="Copy"
                      >
                        {copiedId === account._id + '-num' ? <FaCheckCircle className="copied" /> : <FaCopy />}
                      </button>
                    </div>
                  </div>

                  {account.iban && (
                    <div className="bank-info-row">
                      <span className="bank-info-label">IBAN</span>
                      <div className="bank-info-copy">
                        <span className="bank-info-value mono">{account.iban}</span>
                        <button
                          className="copy-btn"
                          onClick={() => copyToClipboard(account.iban, account._id + '-iban')}
                          title="Copy"
                        >
                          {copiedId === account._id + '-iban' ? <FaCheckCircle className="copied" /> : <FaCopy />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Instructions */}
                {account.instructions && (
                  <div className="bank-instructions">
                    <p>{account.instructions}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BankDetails;
