import React, { CSSProperties } from 'react';
import styled from 'styled-components';

interface CSSPropertiesWithVars extends CSSProperties {
  '--i'?: number;
}

const BubbleButton = ({ onClick, disabled, className, children }: any) => {
  return (
    <StyledWrapper className={className}>
      <button className="button" onClick={onClick} disabled={disabled}>
        <div className="content">
          {children || 'Get This Website'}
        </div>
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .button {
    --blue-300: #93c5fd;
    --blue-400: #60a5fa;
    --blue-500: #3b82f6;
    --blue-600: #2563eb;
    
    border-radius: 50px;
    outline: none;
    cursor: pointer;
    font-size: 16px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-weight: 600;
    letter-spacing: -0.5px;
    border: 2px solid var(--blue-400);
    position: relative;
    padding: 14px 28px;
    background: linear-gradient(to bottom, var(--blue-400), var(--blue-600));
    color: white;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  .button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
    background: linear-gradient(to bottom, var(--blue-300), var(--blue-500));
  }

  .button:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  }

  .button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .content {
    position: relative;
    z-index: 1;
  }
`;

export default BubbleButton;
