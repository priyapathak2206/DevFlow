
interface NavbarProps {
  userName?: string;
  onLogout?: () => void;
}

function Navbar({ userName, onLogout }: NavbarProps) {
  return (
    <header className="header">
      <h1>DevFlow</h1>

      <nav>
        {userName ? (
          <>
            <span className="nav-user">Hi, {userName}</span>
            <button
              className="logout-button"
              type="button"
              onClick={onLogout}
            >
              Log out
            </button>
          </>
        ) : (
          <span className="nav-tagline">Project workspace</span>
        )}
      </nav>
    </header>
  );
}

export default Navbar;