import React from 'react';
import { Link, NavLink } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-custom">
      <div className="container">
        {/* Use Link for client-side routing */}
        <Link className="navbar-brand" to="/">
          <span className="brand-highlight">AI HR Agent 🤖  </span>
        </Link>
        {/* ... toggler button ... */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              {/* Use NavLink for active styling */}
              <NavLink className="nav-link" to="/" end>
                Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/jobs">
                Job Postings
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/settings">
                Settings
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;