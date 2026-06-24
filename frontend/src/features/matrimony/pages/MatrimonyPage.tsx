/**
 * MatrimonyPage — redirects to the real Sakinah matchmaking flow.
 * The old hub (fake stats, hardcoded profiles, setTimeout fake-save)
 * has been removed. All matrimony functionality lives under /sakinah/.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function MatrimonyPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/sakinah/welcome', { replace: true });
  }, [navigate]);

  return null;
}

export default MatrimonyPage;
