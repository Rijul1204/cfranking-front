// App.js

import React, {Component} from 'react';
import Select from 'react-select';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator'
import axios from 'axios';
import "./index.css";
import "./countries.js"

class App extends Component {

    state = {
        contestName: "test",
        phase: 'phase',
        standings: [],
        columns: [
            {
                dataField: 'rank',
                text: 'Rank',
                style: function callback(cell, row, rowIndex, colIndex) {
                    if (rowIndex % 2 == 0) {
                        return {color: 'blue'};
                    }
                }

            },
            {
                dataField: 'handle',
                text: 'Handle',
                formatter: (cell, row) => {
                    if (typeof cell === 'object') {
                        return cell.name;
                    } else {
                        return "";
                    }
                },
                style: function callback(cell, row, rowIndex, colIndex) {
                    let color = 'black';
                    if (typeof cell != 'object') {
                        return {color: 'black'};
                    }
                    if (cell.rank === 'master' || cell.rank === 'international master') {
                        color = 'orange';
                    }
                    if (cell.rank === 'candidate master') {
                        color = 'purple';
                    }
                    if (cell.rank === 'expert') {
                        color = 'blue';
                    }
                    if (cell.rank === 'specialist') {
                        color = 'Cyan';
                    }
                    if (cell.rank === 'pupil') {
                        color = 'green';
                    }
                    if (cell.rank === 'newbie') {
                        color = 'grey';
                    }

                    return {
                        'color': color,
                        'fontWeight': 'bold'
                    };
                }
            },
            {
                dataField: 'score',
                text: 'Score',
                formatter: (value, row) => (
                    <span>
                        {value}
                        {row.alert && <span> [ALERT-ICON]</span>}
                  </span>
                )
            }],
        contests: [],
        countries: [
            {label: "All", value: "all"},
            {label: "Bangladesh", value: "Bangladesh"},
            {label: "China", value: "China"},
            {label: "Russia", value: "Russia"},
            {label: "Japan", value: "Japan"},
            {label: "India", value: "India"},
            {label: "Belarus", value: "Belarus"}
        ],
        contestId: 1,
        country: "all",
        loadCompleted: false
    }

    componentDidMount() {

        axios.get('http://rashedulhasanrijul.com:8080/contests')
            .then(response => {
                var contests = response.data.result.map((value, index, array) => {
                    var row = {};
                    row.value = value.id;
                    row.label = value.name;
                    row.type = value.type;
                    row.phase = value.phase;
                    return row;
                })

                this.setState({
                    contests: contests
                });
            });


    }

    getInitialColumns() {
        var columns = [
            {
                dataField: 'rank',
                text: 'Rank',
                style: function callback(cell, row, rowIndex, colIndex) {
                    if (rowIndex % 2 == 0) {
                        return {color: 'blue'};
                    }
                }

            },
            {
                dataField: 'handle',
                text: 'Handle',
                formatter: (cell, row) => {
                    let url = "http://codeforces.com/profile/" + cell.name;
                    let className = cell.rank + " bold";
                    if (cell.rank === 'candidate master') {
                        className = "candidate-master bold";
                    }
                    if (typeof cell === 'object') {
                        return <a class={className} href={url} target="_blank">{cell.name}</a>;
                    } else {
                        return "";
                    }
                },
                style: function callback(cell, row, rowIndex, colIndex) {
                    let color = 'black';
                    if (typeof cell != 'object') {
                        return {color: 'black'};
                    }
                    if (cell.rank === 'candidate master') {
                        color = 'purple';
                    }
                    color = color + " !important"
                    return {
                        'color': color,
                        'fontWeight': 'bold'
                    };
                }
            },
            {
                dataField: 'score',
                text: 'Score',
                formatter: (value, row) => (
                    <span>
                        {value}
                        {row.alert && <span> [ALERT-ICON]</span>}
                  </span>
                )
            }];
        return columns;
    }

    rowDesign = function (cell, row, rowIndex, colIndex) {
        if (parseInt(cell) > 0) {
            return {
                color: 'green',
                'font-weight': 'bold'
            };
        }

        return {
            opacity: 0
        };
    }

    parseStanding() {
        let url = 'http://rashedulhasanrijul.com:8080/standings/' + this.state.contestId + '?country=' + this.state.country;
        this.setState({
            loadCompleted: false
        });
        axios.get(url)
            .then(response => {
                var columns = this.getInitialColumns();
                var problemList = [];
                response.data.contestMeta.problemList.forEach((value, index, array) => {
                    let column = {};
                    column.dataField = value.index;
                    column.text = value.index;
                    problemList.push(column);
                    column.style = this.rowDesign;
                    columns.push(column);
                });

                var standings = response.data.rows.map((value, index, array) => {
                    var row = {};
                    row.rank = value.standing;
                    row.handle = {};
                    row.handle.name = value.handle;
                    row.handle.rank = value.userRank;
                    row.score = value.points;
                    value.problemResultList.forEach((value, index) => {
                        row[problemList[index].dataField] = value.points;
                    });
                    console.log(row);
                    return row;
                })

                this.setState({
                    standings: standings,
                    contestName: response.data.contestMeta.name,
                    phase: response.data.contestMeta.phase,
                    columns: columns,
                    loadCompleted: true
                });
            });
    }

    fetchStanding(selectObj) {
        this.state.loadCompleted = false;
        this.state.contestId = selectObj.value;
        this.parseStanding();
        this.state.loadCompleted = true;
    }

    fetchStandingByCountry(selectObj) {
        this.state.loadCompleted = false;
        this.state.country = selectObj.value;
        this.parseStanding();

    }


    render() {
        return (
            <div className="container" style={{marginTop: 50}}>
                <div className="selector">
                    <div className="row">
                        <div className="col-md-6">
                            <div className="title">Contest name :</div>
                            <Select options={this.state.contests} onChange={this.fetchStanding.bind(this)}/>
                        </div>
                        <div className="col-md-6">
                            <div className="title">Country :</div>
                            <Select options={this.state.countries} onChange={this.fetchStandingByCountry.bind(this)}/>
                        </div>
                    </div>
                </div>

                <div className="table-title">
                    <div className="row"/>
                    <div className="row"/>
                    <div className="row"/>
                    <div className="row"/>
                    <div className="row">
                        <div className="col-md-4"></div>
                        {this.state.loadCompleted ?
                            <div className="col-md-4">
                                <h2 className="test">{this.state.contestName}({this.state.phase})</h2>
                            </div>
                            :
                            <div className="col-md-4">
                                <h2 className="test">Loading ....</h2>
                            </div>
                        }
                        <div className="col-md-4"></div>
                    </div>
                </div>
                <div className="row rank-table">
                    <div className="col-md-12">
                        <BootstrapTable
                            striped
                            hover
                            keyField='id'
                            data={this.state.standings}
                            columns={this.state.columns}
                            pagination={paginationFactory()}
                        >
                        </BootstrapTable>
                    </div>
                </div>
            </div>
        )
            ;
    }
}

export default App;