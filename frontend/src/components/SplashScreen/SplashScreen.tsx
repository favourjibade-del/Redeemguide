import './SplashScreen.css'

export default function SplashScreen() {
  return (
    <section className="splash-screen">
      <div className="splash-screen__background">
        <img 
          src="/src/assets/splash-hero.jpg" 
          alt="Redemption City of God" 
          className="splash-screen__image"
        />
        <div className="splash-screen__overlay" />
      </div>
      
      <div className="splash-screen__content">
        <div className="splash-screen__text">
          <p className="splash-screen__welcome">Welcome to</p>
          <h1 className="splash-screen__title">Redemption City of God</h1>
          <p className="splash-screen__tagline">
            Empowering purpose. Enriching lives. Building a better world through faith and technology.
          </p>
          
          <div className="splash-screen__features">
            <div className="feature">
              <svg className="feature__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Secure</span>
            </div>
            <div className="feature">
              <svg className="feature__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              <span>Fast</span>
            </div>
            <div className="feature">
              <svg className="feature__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>Reliable</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
