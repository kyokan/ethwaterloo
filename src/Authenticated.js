import React, { Component } from 'react';
import axios from 'axios';

class Authenticated extends Component {
  render() {
    return (
      <div className="authenticated">
        <div
          className="authenticated__headline"
        />
        <div
          className="authenticated__video-thumbnail"
        />
        <button
          className="authenticated__button"
          onClick={async () => {
            const { data: { url } } = await axios.request({
              url: '/download',
              method: 'post',
              headers: {
                Authorization: `${localStorage.getItem('jwt')}`,
              }
            })

            if (url) return window.open(url, '_blank');

            window.location = '/subscribe';
          }}
        >
          Play
        </button>
        <div className="authenticated__footer-image" />
      </div>
    );
  }
}

export default Authenticated;
