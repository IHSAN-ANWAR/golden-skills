import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import "bootstrap/dist/css/bootstrap.min.css"
import "./ForgotPassword.css"
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const validateEmail = () => {
    if (!email.trim()) {
      setError('Email is required')
      return false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(email.trim())) {
      setError('Please enter a valid email address')
      return false
    }
    setError('')
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateEmail()) return

    setLoading(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (data.success) {
        setMessage(data.message)
        // For testing - show the reset link in console and alert
        if (data.resetLink) {
          console.log('Reset Link:', data.resetLink)
          alert(`Reset link: ${data.resetLink}`)
        }
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError('Failed to process request. Please try again.')
      console.error('Forgot password error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='forgot-password-wrapper min-vh-100 d-flex align-items-center justify-content-center'>
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-12 col-sm-8 col-md-6 col-lg-4">
                    <div className="card shadow-lg border-0">
                        <div className="card-body p-4 p-md-5">
                            <div className="text-center mb-4">
                                <h1 className="h2 mb-2 text-golden">Forgot Password</h1>
                                <p className="text-muted">Enter your email to reset your password</p>
                            </div>

                            {message && (
                                <div className="alert alert-success" role="alert">
                                    {message}
                                </div>
                            )}

                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0">
                                            <FaEnvelope className='text-muted' />
                                        </span>
                                        <input 
                                        type="email"
                                        className={`form-control border-start-0 ${error ? 'is-invalid' : ''}`}
                                        placeholder='Enter your email'
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onBlur={validateEmail}
                                        />
                                    </div>
                                </div>

                                <button 
                                  type='submit' 
                                  className="btn btn-golden w-100 py-2 mb-3"
                                  disabled={loading}
                                >
                                    {loading ? 'Sending...' : 'Send Reset Link'}
                                </button>

                                <div className="text-center">
                                    <Link to="/login" className="text-muted d-flex align-items-center justify-content-center">
                                        <FaArrowLeft className="me-2" />
                                        Back to Login
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default ForgotPassword