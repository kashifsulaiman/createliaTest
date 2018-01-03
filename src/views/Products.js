import React, { Component } from 'react';

class Products extends Component {

    constructor(props){
        super(props);
        this.state = {
            data: [],
            page: 1,
            loading: false,
            ended: false
        }
        this.handleScroll = this.handleScroll.bind(this);
    }

    componentWillMount(){
        this.totalRecords();
        this.getProducts(this.state.page, 20)
    }

    componentDidMount() {
        window.addEventListener("scroll", this.handleScroll);
    }

    componentWillUnmount() {
        window.removeEventListener("scroll", this.handleScroll);
    }

    totalRecords(){
        fetch('http://localhost:3000/products').then((resp) => resp.json()) // Transform the data into json
            .then((data) => {
                this.setState({total: data.length});
                // Create and append the li's to the ul
            }).catch(function(error) {
            console.log('There has been a problem with your fetch operation: ', error.message);
            this.setState({loading: false});
        });
    }

    handleScroll() {
        const {page, loading, data, total} = this.state;
        const windowHeight = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;
        const body = document.body;
        const html = document.documentElement;
        const docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight,  html.scrollHeight, html.offsetHeight);
        const windowBottom = windowHeight + window.pageYOffset;
        if (windowBottom >= docHeight) {
            console.log('bottom reached');
            if(data.length < total){
                !loading && this.getProducts(page + 1, data.length + 20 > total ? total - data.length : 20);
            }
            else{
                this.setState({ended: true})
            }
        }
    }

    formatDate(date) {
        var date1 = new Date(date);
        var date2 = new Date();
        var timeDiff = Math.abs(date2.getTime() - date1.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return diffDays > 7 ? date : diffDays + " days ago";
    }

    getProducts(page, limit){
        console.log(page, limit)
        this.setState({page, limit, loading: true});
        fetch('http://localhost:3000/products?_page=' + page + '&_limit=' + limit).then((resp) => resp.json()) // Transform the data into json
            .then((data) => {
                console.log('data*****');
                console.log(this.state.data.concat(data));
                this.setState({data: this.state.data.concat(data), loading: false});
                // Create and append the li's to the ul
            }).catch(function(error) {
                console.log('There has been a problem with your fetch operation: ', error.message);
                this.setState({loading: false});
        });
    }

    render() {
        const {data, loading, ended} = this.state;
        return <div>
            <div className="table-responsive-sm">
                <table className="table">
                    <thead>
                    <tr>
                        <th scope="col">Id</th>
                        <th scope="col">Face</th>
                        <th scope="col">Size</th>
                        <th scope="col">Price</th>
                        <th scope="col">Date</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data.map((product, index) => {
                        return <tr key={index}>
                            <th scope="row">{product.id}</th>
                            <td style={{fontSize: product.size}}>{product.face}</td>
                            <td>{product.size}</td>
                            <td>${product.price/100}</td>
                            <td>{this.formatDate(product.date)}</td>
                            {!(index % 20) && <td><img src={'http://localhost:3000/ads/?r=' + Math.floor(Math.random()*1000)}/></td>}
                        </tr>
                    })
                    }
                    </tbody>
                </table>
                {loading && <div style={{textAlign: 'center', marginBottom: 30}}>
                    <img src={require('../assets/loading.gif')} width="30"/> loading...
                </div>}
                {ended && <div style={{textAlign: 'center', marginBottom: 30}}>
                    ~ end of catalogue ~
                </div>}
            </div>
        </div>
    }
}

export default Products;