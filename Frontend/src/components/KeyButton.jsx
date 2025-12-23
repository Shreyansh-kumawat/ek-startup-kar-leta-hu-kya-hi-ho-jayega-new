import React from 'react';
import styled from 'styled-components';

const KeyButton = ({ children, onClick, disabled, className }) => {
  return (
    <StyledWrapper className={className}>
      <div className="d3wrapper">
        <div className="cover">
          <button 
            className="keyButton" 
            onClick={onClick}
            disabled={disabled}
          >
            {children}
          </button>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  position: relative;
  width: 100%;
  height: fit-content;
  padding: 20px 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .d3wrapper {
    position: relative;
    transform-style: preserve-3d;
    perspective: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
  
  .cover {
    background-color: rgb(0, 0, 0);
    min-height: 64px;
    width: 100%;
    border-radius: 10px;
    transform: rotateX(13deg);
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 10px 11px 10px;
    box-shadow: 0px 1px 1px 1px white;
    /* Remove any border that might be causing the line */
    border: none;
    outline: none;
  }
  
  .keyButton {
    cursor: pointer;
    border: none;
    border-bottom: 2px solid white;
    background-color: rgb(221, 221, 221);
    box-shadow: 0px 4px 0px 0.2px rgb(116, 116, 116);
    min-height: 60px;
    width: 100%;
    padding: 12px 15px;
    border-radius: 8px;
    transform: rotateX(13deg);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotateX(13deg);
    transition: all 80ms ease;
    color: rgba(0, 0, 0, 0.7);
    font-weight: 600;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    line-height: 1.3;
    text-align: center;
    overflow: hidden;
    outline: none;
    
    /* Small screens - stack vertically */
    @media (max-width: 485px) {
      font-size: 11px;
      padding: 10px 12px;
      min-height: 55px;
      
      & > div {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2px;
        width: 100%;
        
        span {
          display: block;
          white-space: nowrap;
        }
      }
    }
    
    /* Medium to Large screens - single line or wrapped */
    @media (min-width: 486px) {
      font-size: 13px;
      padding: 12px 15px;
      min-height: 58px;
      
      & > div {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        gap: 4px;
        width: 100%;
        
        span {
          white-space: nowrap;
        }
      }
    }
    
    /* Large screens - better spacing */
    @media (min-width: 640px) {
      font-size: 15px;
      min-height: 60px;
      
      & > div {
        gap: 5px;
      }
    }
    
    &:hover:not(:disabled) {
      background-color: rgb(230, 230, 230);
    }
    
    &:active:not(:disabled) {
      box-shadow: 0px 0px 0px 0.2px rgba(116, 116, 116, 0);
      transform: translate(-50%, calc(-50% + 4.5px)) rotateX(13deg);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    &:focus {
      outline: none;
    }
  }
  
  /* Adjust cover height based on screen size */
  @media (max-width: 485px) {
    .cover {
      min-height: 61px;
      padding: 6px 10px 9px 10px;
    }
  }
  
  @media (min-width: 486px) {
    .cover {
      min-height: 50px;
      padding: 7px 10px 11px 10px;
    }
  }
`;

export default KeyButton;
