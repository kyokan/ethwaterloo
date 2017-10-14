import React, { Component } from 'react';

class Authenticated extends Component {
  render() {
    return (
      <div className="authenticated">
        <div className="authenticated__header">
          <h1>All Videos</h1>
        </div>
        <div className="authenticated__videos-row">
          <div className="authenticated__video">
            <iframe
              width="300"
              height="150"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              frameBorder="0"
              allowFullScreen>
            </iframe>
          </div>
          <div className="authenticated__video">
            <iframe
              width="300"
              height="150"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              frameBorder="0"
              allowFullScreen>
            </iframe>
          </div>
          <div className="authenticated__video">
            <iframe
              width="300"
              height="150"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              frameBorder="0"
              allowFullScreen>
            </iframe>
          </div>
        </div>
        <div className="authenticated__videos-row">
          <div className="authenticated__video">
            <iframe
              width="300"
              height="150"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              frameBorder="0"
              allowFullScreen>
            </iframe>
          </div>
          <div className="authenticated__video">
            <iframe
              width="300"
              height="150"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              frameBorder="0"
              allowFullScreen>
            </iframe>
          </div>
          <div className="authenticated__video">
            <iframe
              width="300"
              height="150"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              frameBorder="0"
              allowFullScreen>
            </iframe>
          </div>
        </div>
      </div>
    );
  }
}

export default Authenticated;
