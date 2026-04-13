import React from 'react';
import './Skeleton.css';

/**
 * Skeleton component to show a loading placeholder.
 * @param {Object} props
 * @param {string} [props.type="text"] - 'text', 'circle', 'button', or 'rect'
 * @param {string|number} [props.width] - custom width (e.g. '100%', '50px')
 * @param {string|number} [props.height] - custom height
 * @param {Object} [props.style] - extra inline styles
 * @param {string} [props.className] - extra class names
 */
const Skeleton = ({ type = 'text', width, height, style = {}, className = '' }) => {
    let typeClass = 'skeleton-text';
    if (type === 'circle') typeClass = 'skeleton-circle';
    if (type === 'button') typeClass = 'skeleton-button';
    if (type === 'rect') typeClass = '';

    const dynamicStyle = {
        width: width || (type === 'circle' ? '40px' : undefined),
        height: height || (type === 'circle' ? '40px' : undefined),
        ...style
    };

    return (
        <div 
            className={`skeleton ${typeClass} ${className}`} 
            style={dynamicStyle}
        />
    );
};

export default Skeleton;
