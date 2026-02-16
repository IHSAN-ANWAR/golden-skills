import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import "bootstrap/dist/css/bootstrap.min.css"
import "./Login.css"
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa'
import { API_ENDPOINTS } from '@/config/apiConfig'

const Login = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const validateForm = () => {
    const newErrors = {}
    
    // Username validation
    if (!username.trim()) {
      newErrors.username = 'Username is required'
    }
    
    // Password validation
    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    return newErrors
  }

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true })
    const newErrors = validateForm()
    setErrors(newErrors)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // TEMPORARY BYPASS - REMOVE LATER
    // Just store a fake token and redirect to dashboard
    localStorage.setItem('adminToken', 'temporary-bypass-token');
    alert('Login bypassed - Temporary access granted!');
    navigate('/admin/dashboard');
    return;
    
    // ORIGINAL CODE BELOW - COMMENTED OUT FOR TEMPORARY BYPASS
    /*
    // Mark all fields as touched
    setTouched({ username: true, password: true })
    
    // Validate
    const newErrors = validateForm()
    setErrors(newErrors)
    
    // If no errors, proceed with login
    if (Object.keys(newErrors).length === 0) {
      try {
        const response = await fetch(API_ENDPOINTS.AUTH.ADMIN_LOGIN, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
          // Store token and redirect
          localStorage.setItem('adminToken', data.token);
          alert('Login successful!');
          navigate('/admin/dashboard');
        } else {
          alert(data.message || 'Login failed');
        }
      } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please check your connection.');
      }
    }
    */
  }

  return (
    <div className='login-wrapper min-vh-100 d-flex align-items-center justify-content-center'>
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-12 col-sm-8 col-md-6 col-lg-4">
                    <div className="card shadow-lg border-0">
                        <div className="card-body p-4 p-md-5">
                            <div className="text-center mb-4">
                                <h1 className="h2 mb-2 text-golden">ADMIN LOGIN</h1>
                                <p className="text-muted">Login to your admin account</p>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0">
                                            <FaUser className='text-muted' />
                                        </span>
                                        <input 
                                        type="text"
                                        className={`form-control border-start-0 ${touched.username && errors.username ? 'is-invalid' : ''} ${touched.username && !errors.username && username ? 'is-valid' : ''}`}
                                        placeholder='Username'
                                        value={username}
                                        onChange={(e)=> setUsername(e.target.value)}
                                        onBlur={() => handleBlur('username')}
                                        />
                                    </div>
                                    {touched.username && errors.username && (
                                        <div className="invalid-feedback d-block">
                                            {errors.username}
                                        </div>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0">
                                            <FaLock className='text-muted' />
                                        </span>
                                        <input
                                        type={showPassword ? "text" : "password"}
                                        className={`form-control border-start-0 border-end-0 ${touched.password && errors.password ? 'is-invalid' : ''} ${touched.password && !errors.password && password ? 'is-valid' : ''}`}
                                        placeholder='Password'
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onBlur={() => handleBlur('password')}
                                        />
                                        <span className="input-group-text bg-light border-start-0">
                                        {showPassword ? 
                                        <FaEyeSlash 
                                        className='text-muted' 
                                        style={{cursor: 'pointer'}} 
                                        onClick={() => setShowPassword(!showPassword)} /> 
                                        : 
                                        <FaEye 
                                        className='text-muted' 
                                        style={{cursor: 'pointer'}} 
                                        onClick={() => setShowPassword(!showPassword)} 
                                        />
                                        }
                                        </span>
                                    </div>
                                    {touched.password && errors.password && (
                                        <div className="invalid-feedback d-block">
                                            {errors.password}
                                        </div>
                                    )}
                                </div>

                                <button type='submit' className="btn btn-golden w-100 py-2 mb-3">
                                    LOGIN
                                </button>

                                <div className="text-center mb-3">
                                    <Link to="/forgot-password" className="text-muted" style={{textDecoration: 'underline'}}>
                                        Forgot Password?
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

export default Login