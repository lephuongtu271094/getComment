import React, { Component } from 'react';
import './App.css';
import moment from 'moment';
import axios from 'axios';

const regexCheckUrl = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm;
const url = "https://graph.facebook.com/v3.1/"
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [
        // {
        //   "created_time": "2018-09-22T04:19:42+0000",
        //   "from": {
        //     "name": "Tu Phuong",
        //     "id": "471429756679558"
        //   },
        //   "message": "14545",
        //   "id": "471419796680554_471420153347185"
        // },
        // {
        //   "created_time": "2018-09-22T04:19:49+0000",
        //   "from": {
        //     "name": "Tu Phuong",
        //     "id": "471429756679558"
        //   },
        //   "message": "555",
        //   "id": "471419796680554_471420226680511"
        // },
        // {
        //   "created_time": "2018-09-22T05:10:20+0000",
        //   "message": "dg adsf á d á á á á",
        //   "id": "471419796680554_471433973345803"
        // }
      ],
      paging: {
        // "cursors": {
        //   "before": "QVFIUmY0NURERzVxdndOdkx2RFBKZAGhBWmhuY256d0t1ZA1lPQll2bmtZATXZAsVElGVzRScXJyU2U5MjZApeVVjanhRRkxXT1JzSUVwWGppRFY3d2dSMkZA0VFlR",
        //   "after": "QVFIUlFnUGpvUEMxM042ZAmdfTFIwVDhGOWlnUEJId2hPMlJVc0lJdjRLVC1aN2Jxc0dVRWFRdE54YWpqSmliaFdDdWVLeWdwamVJUy1yeTdyZAC1WdC1TQXFR"
        // }
      },
      summary: {
        // "order": "chronological",
        // "total_count": 3,
        // "can_comment": true
      },
      textSearch: '',
      token: '',
      urlVideos: '',
      openSearch: false,
      errorMessage: ''
    };
    this.onChangeTextInput = this.onChangeTextInput.bind(this);
    this.onGetComment = this.onGetComment.bind(this);
    this.handlerTableData = this.handlerTableData.bind(this);
    this.handlerTableSearch = this.handlerTableSearch.bind(this);
    this.handlerGetComment = this.handlerGetComment.bind(this);
  }

  onChangeTextInput(e) {
    this.setState({
      [e.target.name]: e.target.value
    })
  }
  onGetComment(e) {
    const urlVideos = this.state.urlVideos;
    const token = this.state.token;
    const self = this;
    if (urlVideos.match(regexCheckUrl) && token.length !== 0) {
      let pathArray = urlVideos.split('/')[5];
      //&limit=4000
      //https://developers.facebook.com/tools/explorer/
      let pathGetComment = `${url}${pathArray}/comments?fields=created_time,message&filter=stream&summary=true&access_token=${token}`
      axios.get(pathGetComment,
        { crossdomain: true }
        )
        .then((response) => {
          // handle success
          self.setState(
            {
              data: response.data.data,
              paging: response.data.paging,
              summary: response.data.summary,
              openSearch: true,
              errorMessage: ''
            }
          )
        })
        .catch((error) => {
          // handle error
          this.setState({
            errorMessage: error.message
          })
        })
    } else {
      this.setState({
        errorMessage: 'url không đúng định dạng và mã bảo mật không được để trống'
      })
    }
  }

  handlerTableData(newData) {
    let totalComment = this.state.summary.total_count;
    return (
      <div>
        <p style={{fontSize: '24px', margin: '20px'}}>Số lượng comment : {totalComment || 0}</p>
        <table className="table">
          <thead>
            <tr>
              <th>Stt</th>
              <th>Time</th>
              <th>Comment</th>
            </tr>
          </thead>
          <tbody>
            {
              newData.map((element, index) => {
                return <tr key={index}>
                  <td>{index}</td>
                  <td>{moment(element.created_time).format('LT')}</td>
                  <td className="table_style">{element.message}</td>
                </tr>
              })
            }
          </tbody>
        </table>
      </div>
    )
  }

  handlerTableSearch(data, textSearch) {
    let newData = []
    let totalComment = this.state.summary.total_count;
    if (textSearch) {
      const regex = new RegExp(textSearch, 'ig');
      let dataFilter = data.filter(({ message }) => message.match(regex));
      newData = dataFilter;
      totalComment = dataFilter.length;
    } else {
      newData = data
    }
    return (
      <div>
        <p style={{fontSize: '24px', margin: '20px'}}>Số lượng comment : {totalComment || 0}</p>
        <table className="table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Comment</th>
            </tr>
          </thead>
          <tbody>
            {
              newData.map((element, index) => {
                return <tr key={index}>
                  <td>{moment(element.created_time).format('LT')}</td>
                  <td className="table_style">{element.message}</td>
                </tr>
              })
            }
          </tbody>
        </table>
      </div>
    )
  }

  handlerGetComment() {
    return (
      <div className="conent">
        <div className="form-group">
          <label htmlFor="usr">Nhập link video</label>
          <input type="text"
            name="urlVideos"
            onChange={this.onChangeTextInput}
            className="form-control"
            id="usr" />
        </div>
        <div className="form-group">
          <label htmlFor="pwd">Mã bảo mật</label>
          <input type="text"
            className="form-control"
            name="token"
            onChange={this.onChangeTextInput}
            id="pwd" />
        </div>
        <button type="button" className="btn btn-primary"
          onClick={this.onGetComment}
        >Get Comment</button>
      </div>
    )
  }

  inputSearch() {
    return (
      <input type="text"
        name="textSearch"
        placeholder="Tìm kiếm comment"
        onChange={this.onChangeTextInput}
        className="form-control"
        id="usr" />
    )
  }

  render() {
    return (
      <div className="App">
        {
          this.state.openSearch ? this.inputSearch() : this.handlerGetComment()
        }
        {
          this.state.errorMessage.length > 0 ? <p style={{ color: 'red' }}>{this.state.errorMessage}</p> : ''
        }
        {
          this.state.textSearch.length > 0 ? this.handlerTableSearch(this.state.data, this.state.textSearch) : this.state.data.length > 0 ? this.handlerTableData(this.state.data) : ''
        }
      </div>
    );
  }
}

export default App;
