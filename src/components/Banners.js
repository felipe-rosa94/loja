import React from 'react'
import '../styles/banners.css'
import {Carousel} from 'react-bootstrap'
import {CardMedia} from '@material-ui/core'

class Banners extends React.Component {
    render() {
        const {banners} = this.props
        return (
            <Carousel id="carousel">
                {
                    banners.map(((i, index) => {
                        return (
                            <Carousel.Item id="banner" key={index}>
                                <CardMedia image={i.url} id="img-carousel"/>
                            </Carousel.Item>
                        )
                    }))
                }
            </Carousel>
        )
    }
}

export default Banners