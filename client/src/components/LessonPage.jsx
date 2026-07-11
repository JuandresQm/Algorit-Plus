import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import LessonPlayer from './LessonPlayer';

const LessonPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const lessonContainerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [lessonCompleted, setLessonCompleted] = useState(false);
const playerRef = useRef(null);
const handleLogoClick = () => {
    if (playerRef.current) {
      playerRef.current.saveCurrentProgress();
    }
  };
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const enterFullscreen = () => {
      const target = lessonContainerRef.current || document.documentElement;
      if (target?.requestFullscreen) {
        target.requestFullscreen().catch(() => {});
      }
    };

    const timer = window.setTimeout(enterFullscreen, 150);
    return () => window.clearTimeout(timer);
  }, [id]);

  useEffect(() => {
    return () => {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  return (
    <div
      ref={lessonContainerRef}
      style={{
        minHeight: '100vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        background: '#F0F2F5',
      }}
    >
        <nav style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: isMobile ? '10px 20px' : '10px 50px', 
                gap: '20px',
                flexWrap: 'wrap', 
                backgroundColor: '#EEEEEE',
        borderBottom: '1px solid #ccc' 
              }}>
                
                <div style={{ 
                  fontFamily: "'Jersey 20', sans-serif", 
                  fontSize: isMobile ? '38px' : '45px', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  userSelect: 'none'
                }}>
                 <Link to="/" onClick={handleLogoClick} style={{textDecoration: 'none'}}>
                  <span style={{ 
                    color: '#E5E5E7', 
                    WebkitTextStroke: '1px #2D3354' 
                  }}>
                    {isMobile ? 'Alg' : 'Algorit'}
                  </span>
                  <span style={{ 
                    color: '#2D3354'
                  }}>
                    +
                  </span>
                  </Link>
                </div>
              </nav>
    <div style={{ padding: '24px', minHeight: '100vh', background: '#F0F2F5' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Jersey 20', sans-serif", color: '#2D3354', marginBottom: '5px' }}>Lección N° {id}</h1>
        <LessonPlayer lessonId={id} ref={playerRef} onProgress={() => {
          if (!lessonCompleted) {
            setLessonCompleted(true);
            navigate('/inicio');
          }
        }} />
      </div>
    </div>
    </div>
  );
};

export default LessonPage;
