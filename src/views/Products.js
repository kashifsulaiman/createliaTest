import React, { Component } from 'react';

class Products extends Component {

    constructor(props){
        super(props);
        this.state = {
            data: [],
            extraData: [],
            page: 1,
            loading: false,
            ended: false,
            usedImages: [],
            requestedFor: []
        }
        this.handleScroll = this.handleScroll.bind(this);
    }

    componentWillMount(){
        this.totalRecords();
        this.getProducts(this.state.page, 40)
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
        const {data, extraData, sortBy} = this.state;
        if(extraData.length){
            this.setState({data: this.state.data.concat(extraData)})
        }
        this.setState({page, limit, loading: true});
        var url = 'http://localhost:3000/products?_page=' + page + '&_limit=' + limit;
        sortBy && (url += '&_sort=' + sortBy);
        fetch(url).then((resp) => resp.json()) // Transform the data into json
            .then((newData) => {
                if(!data.length){
                    let extraData = newData.slice(20);
                    newData.length = 20;
                    this.setState({data: newData, extraData, loading: false});
                } else {
                    this.setState({extraData: newData, loading: false});
                }
            }).catch((error) => {
            console.log('There has been a problem with your fetch operation: ', error.message);
            this.setState({loading: false});
        });
    }

    getImage(index){
        var {usedImages, requestedFor} = this.state;
        let isUsed = usedImages.filter(e => e.index === index).length;
        if (!isUsed && !requestedFor.includes(index)) {
            this.setState({requestedFor: this.state.requestedFor.concat([index])});

            fetch('http://localhost:3000/ads/?r=' + Math.floor(Math.random()*1000)).then((resp) => {
                let image = resp.url,
                    isImageUsed = usedImages.filter(e => e.image === image).length;

                usedImages.push({index, image: isImageUsed ? this.generateNewUrl(image) : image});
                this.setState(usedImages);
            }).catch((error) => {
                console.log('There has been a problem with your fetch operation: ', error.message);
            })
        }

    }

    generateNewUrl(image){
        const {ended} = this.state;
        let randomNumber = Math.floor(Math.random() * 25);
        var imageArray = image.split("=");
        imageArray[1] = randomNumber;
        image = imageArray.join("=");
        let isUsed = this.state.usedImages.filter(e => e.image === image).length;
        return isUsed && !ended ? this.generateNewUrl(image) : image;
    }

    sort(value){
        this.setState({sortBy: value, data: [], extraData: [], page: 1, ended: false, loading: true});
        var url = 'http://localhost:3000/products?_page=' + 1 + '&_limit=' + 40 + '&_sort=' + value;
        fetch(url).then((resp) => resp.json()) // Transform the data into json
            .then((newData) => {
                let extraData = newData.slice(20);
                newData.length = 20;
                this.setState({data: newData, extraData, loading: false});
            }).catch(function(error) {
            console.log('There has been a problem with your fetch operation: ', error.message);
            this.setState({loading: false});
        });
    }

    renderRows(product, index){
        var {usedImages} = this.state;
        var rows = [0, 1].map((elem) => {
            if(!elem) {
                return <tr id={index + '_a'} key={index + '_a'}>
                    <th scope="row">{product.id}</th>
                    <td style={{fontSize: product.size}}>{product.face}</td>
                    <td>{product.size}</td>
                    <td>${product.price/100}</td>
                    <td>{this.formatDate(product.date)}</td>
                </tr>
            } else {
                this.getImage(index);
                var obj = usedImages.filter((e) => e.index === index);
                return <tr id={index + '_b'} key={index + '_b'}>
                            <td colSpan="5"><div style={styles.randomImage}><p>But first, a word from our sponsors:</p> <img src={obj.length ? obj[0].image : require('../assets/image_loading.gif')} alt="Loading ad..." width="320" height="200"/></div></td>
                        </tr>
            }
        });
        return rows
    }

    render() {
        const {data, loading, ended} = this.state;
        return <div>
            <label style={styles.selectLabel}>Sort By </label>
            <select style={styles.select} onChange={(e) => this.sort(e.target.value)}>
                <option>None</option>
                <option value="id">Id</option>
                <option value="size">Size</option>
                <option value="price">Price</option>
            </select>
            <div className="table-responsive-sm">
                <table className="table table-striped table-bordered " style={styles.table}>
                    <thead  style={styles.tableHead}>
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
                        if(index && !(index % 20)) {
                            return this.renderRows(product, index)
                        }
                        else {
                            return <tr id={index} key={index}>
                                <th scope="row">{product.id}</th>
                                <td style={{fontSize: product.size}}>{product.face}</td>
                                <td>{product.size}</td>
                                <td>${product.price/100}</td>
                                <td>{this.formatDate(product.date)}</td>
                            </tr>
                        }
                    })
                    }
                    </tbody>
                </table>
                {loading && <div style={{textAlign: 'center', marginBottom: 30}}>
                    <img src={require('../assets/loading.gif')} alt="Loading..." width="30"/> loading...
                </div>}
                {ended && <div style={{textAlign: 'center', marginBottom: 30, fontSize: '2.5em'}}>
                    ~ end of catalogue ~
                </div>}
            </div>
        </div>
    }
}

export default Products;

const styles = {
    table: {
        textAlign: 'center',
        boxShadow: '0px 0px 14px 0px'
    },
    tableHead:{
        backgroundColor: 'black'
    },
    select:{
        backgroundColor: '#cec6cd',
        padding: '10px',
        color: 'white',
        fontWeight: 500,
        fontSize: 16,
        marginBottom: 10,
        marginLeft:10,
        border: 'none'
    },
    selectLabel: {
        fontWeight: 400,
        marginLeft: 10,
        fontSize: 20
    },
    randomImage: {
        margin: 10,
        border: '2px solid'
    }

}