import React, { Component } from 'react';

class Authenticated extends Component {
  render() {
    return (
      <div className="authenticated">
        <img
          className="authenticated__video-thumbnail"
          src="https://i.ytimg.com/vi/TgqiSBxvdws/maxresdefault.jpg"
        />
        <button
          className="authenticated__button"
          onClick={() => {
            console.log('request video');
          }}
        >
          Download
        </button>
      </div>
    );
  }
}

export default Authenticated;
