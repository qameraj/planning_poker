'use client';

// ✅ FIXED: Using relative paths to find the 'ui' folder inside 'app'
import Button from '../ui/Button';
import ThemeToggle from '../ui/ThemeToggle';

interface SessionHeaderProps {
  sessionName: string;
  sessionId: string;
  userName: string;
  isSpectator: boolean;
  onLeave: () => void;
}

export default function SessionHeader({
  sessionName,
  sessionId,
  userName,
  isSpectator,
  onLeave,
}: SessionHeaderProps) {
  return (
    <header className="border-b border-light-border dark:border-dark-border sticky top-0 bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-lg z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          
          {/* LEFT */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onLeave}>
              ← Leave
            </Button>

            <div>
              <h1 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
                {sessionName}
              </h1>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                Session ID: {sessionId}
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                {userName}
              </p>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                {isSpectator ? 'Spectator' : 'Voter'}
              </p>
            </div>

            <ThemeToggle />
          </div>

        </div>
      </div>
    </header>
  );
}