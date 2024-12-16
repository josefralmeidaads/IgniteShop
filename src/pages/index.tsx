import Image from "next/image";
import Link from "next/link";
import 'keen-slider/keen-slider.min.css'
import { useKeenSlider } from 'keen-slider/react'
import { GetStaticProps } from "next";

import { HomeContainer, Products } from "../styles/pages/home";

import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

interface HomeProps {
  products: {
    id: string;
    name: string;
    imageUrl: string;
    price: number;
  }[]
}

const Home = ({ products }: HomeProps) => {
  const [ sliderRef ] = useKeenSlider({
    slides: {
      perView: 3,
      spacing: 48,
    },
  })

  return (
    <HomeContainer ref={sliderRef} className="keen-slider">
      {products.map((product) => (
          <Products
            href={`/product/${product.id}`} 
            className="keen-slider__slide" 
            key={product.id}
            prefetch={false}
          >
            <Image src={product.imageUrl} width={520} height={480} alt=""/>
            <footer>
              <strong>{product.name}</strong>
              <span>{product.price}</span>
            </footer>
          </Products>
      ))}
    </HomeContainer>
  )
}

export default Home

export const getStaticProps: GetStaticProps = async() => {
  const response = await stripe.products.list({
    expand: ['data.default_price'],
  })

  const products = response.data.map((product) => {
    const price = product.default_price as Stripe.Price

    return {
      id: product.id,
      name: product.name,
      imageUrl: product.images[0],
      price: Intl.NumberFormat('pt-BR', { currency: 'BRL', style: 'currency' }).format((price.unit_amount ?? 0) / 100),
    }
  })
  return {
    props: {
      products,
    },
    revalidate: 60 * 60 * 2, //2 horas
  }
}