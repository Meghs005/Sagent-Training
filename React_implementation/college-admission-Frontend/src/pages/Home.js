import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { currentUser } = useAuth();

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-decoration"></div>
        <div className="hero-content">
          <div className="hero-eyebrow">College Admissions Portal</div>
          <h1 className="hero-title">
            Your Future<br /><em>Starts Here.</em>
          </h1>
          <p className="hero-desc">
            Apply to college online — track your application progress, upload documents, and receive real-time status updates, all in one place.
          </p>
          <div className="hero-actions">
            {currentUser ? (
              <Link to={currentUser.role === 'OFFICER' ? '/officer' : '/dashboard'}>
                <button className="btn-primary">Go to Dashboard →</button>
              </Link>
            ) : (
              <>
                <Link to="/register"><button className="btn-primary">Get Started</button></Link>
                <Link to="/login"><button className="btn-secondary">Sign In</button></Link>
              </>
            )}
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card hero-card-1">
            <div className="hc-label">Application Status</div>
            <div className="hc-badge accepted">Accepted</div>
            <div className="hc-course">B.Tech Computer Science</div>
          </div>
          <div className="hero-card hero-card-2">
            <div className="hc-label">Documents</div>
            <div className="hc-row"><span className="dot green"></span> Marksheet</div>
            <div className="hc-row"><span className="dot green"></span> ID Proof</div>
          </div>
          <div className="hero-card hero-card-3">
            <div className="hc-label">Fee Payment</div>
            <div className="hc-amount">₹ 1,500</div>
            <div className="hc-status paid">Paid</div>
          </div>
        </div>
      </section>

      <section className="steps-section">
        <div className="section-tag">The Process</div>
        <h2 className="section-title">Six simple steps to admission</h2>
        <div className="steps-grid">
          {[
            { n: '01', title: 'Create Account', desc: 'Register with your name, email, and password to get started.' },
            { n: '02', title: 'Fill Application', desc: 'Enter personal details, academic grades, and select your desired course.' },
            { n: '03', title: 'Upload Documents', desc: 'Submit your marksheet and ID proof securely.' },
            { n: '04', title: 'Pay Fee', desc: 'Complete your application fee payment via multiple options.' },
            { n: '05', title: 'Submit', desc: 'Review and submit. Receive your unique Application ID.' },
            { n: '06', title: 'Track Status', desc: 'Monitor your application — Under Review, Accepted, or Rejected.' },
          ].map((s) => (
            <div className="step-card" key={s.n}>
              <div className="step-number">{s.n}</div>
              <div className="step-title">{s.title}</div>
              <div className="step-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
