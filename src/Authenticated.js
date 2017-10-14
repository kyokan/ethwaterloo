import React, { Component } from 'react';
import axios from 'axios';

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
          Download
        </button>
      </div>
    );
  }
}

export default Authenticated;
