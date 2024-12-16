import React, { useState } from 'react';
import Head from "next/head";
import { ImageContainer, ProductContainer, ProductDetails } from '@/styles/pages/products';
import { GetStaticPaths, GetStaticProps } from 'next';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';
import Image from 'next/image';
import axios from 'axios';

interface ProductProps {
  product: {
    id: string;
    name: string;
    imageUrl: string;
    price: number;
    description: string;
    defaultPriceId: string;
  }
}

const Product = ({ product }: ProductProps) => {
  const [isCreatingCheckoutSession, setIsCreatingCheckoutSession] = useState<boolean>(false);

  const handleBuyProduct = async () => {
    try {
      setIsCreatingCheckoutSession(true)
      const response = await axios.post("/api/checkout", {
        priceId: product.defaultPriceId
      })

      const { checkoutUrl } = response.data

      window.location.href = checkoutUrl;
    } catch(err){
      setIsCreatingCheckoutSession(false)
      alert("Falha ao redirecionar ao checkout!" + err)
    }
  }

  return (
    <>
      <Head>
        <title>{product.name} | Ignite Shop</title>
      </Head>
      <ProductContainer>
        <ImageContainer>
          <Image src={product.imageUrl} width={520} height={480} alt=''/>
        </ImageContainer>

        <ProductDetails>
          <h1>{product.name}</h1>

          <span>{product.price}</span>

          <p>
            {product.description}
          </p>

          <button disabled={isCreatingCheckoutSession} onClick={handleBuyProduct}>Comprar Agora</button>
        </ProductDetails>
      </ProductContainer>
    </>
  )
}

export default Product;

export const getStaticPaths: GetStaticPaths = async() => {
  return {
    paths: [
      {
        params: { id: 'prod_RIiWLQ7EEEG2Rd' },
      },
    ],
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps<any, { id: string }> = async({ params }) => {
  const productId = params?.id || '';

  const product = await stripe.products.retrieve(productId, {
    expand: ['default_price'],
  })

  const price = product.default_price as Stripe.Price

  return {
    props: {
      product: {
        id: product.id,
        name: product.name,
        imageUrl: product.images[0],
        price: Intl.NumberFormat('pt-BR', { currency: 'BRL', style: 'currency' }).format((price.unit_amount ?? 0) / 100),
        description: product.description,
        defaultPriceId: price.id,
      }
    },
    revalidate: 60 * 60 * 1, //1 hour
  }
}