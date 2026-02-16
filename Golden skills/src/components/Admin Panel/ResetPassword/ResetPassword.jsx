import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import "bootstrap/dist/css/bootstrap.min.css"
import "./ResetPassword.css"
import { FaLock, FaEye, FaEyeSlash, FaCheck } from 'react-icons/fa'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    // Get token from URL
    const tokenParam = searchParams.get('token')
    if (tokenParam) {
      setToken(tokenParam)
    } else {
      setError('Invalid reset link. Please request a new password reset.')
    }
  }, [searchParams])

  const validatePasswords = () => {
    if (!newPassword) {
      setError('New password is required')
      return false
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    setError('')
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validatePasswords()) return

    setLoading(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token: token,
          newPassword: newPassword
        })
      })

      const data = await response.json()

      if (data.success) {
        setMessage(data.message)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError('Failed to reset password. Please try again.')
      console.error('Reset password error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='reset-password-wrapper min-vh-100 d-flex align-items-center justify-content-center'>
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-12 col-sm-8 col-md-6 col-lg-4">
                    <div className="card shadow-lg border-0">
                        <div className="card-body p-4 p-md-5">
                            <div className="text-center mb-4">
                                <h1 className="h2 mb-2 text-golden">Reset Password</h1>
                                <p className="text-muted">Enter your new password</p>
                            </div>

                            {message && (
                                <div className="alert alert-success" role="alert">
                                    <FaCheck className="me-2" />
                                    {message}
                                </div>
                            )}

                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0">
                                            <FaLock className='text-muted' />
                                        </span>
                                        <input
                                        type={showPassword ? "text" : "password"}
                                        className={`form-control border-start-0 border-end-0`}
                                        placeholder='New Password'
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        disabled={!token || loading}
                                        />
                                        <span 
                                          className="input-group-text bg-light border-start-0"
                                          onClick={() => setShowPassword(!showPassword)}
                                          style={{cursor: 'pointer'}}
                                        >
                                          {showPassword ? <FaEyeSlash className='text-muted' /> : <FaEye className='text-muted' />}
                                        </span>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0">
                                            <FaLock className='text-muted' />
                                        </span>
                                        <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        className={`form-control border-start-0 border-end-0`}
                                        placeholder='Confirm New Password'
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        disabled={!token || loading}
                                        />
                                        <span 
                                          className="input-group-text bg-light border-start-0"
                                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                          style={{cursor: 'pointer'}}
                                        >
                                          {showConfirmPassword ? <FaEyeSlash className='text-muted' /> : <FaEye className='text-muted' />}
                                        </span>
                                    </div>
                                </div>

                                <button 
                                  type='submit' 
                                  className="btn btn-golden w-100 py-2 mb-3"
                                  disabled={!token || loading}
                                >
                                    {loading ? 'Resetting...' : 'Reset Password'}
                                </button>

                                <div className="text-center">
                                    <Link to="/login" className="text-muted">
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

export default ResetPassword