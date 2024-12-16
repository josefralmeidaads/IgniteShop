import { stripe } from '@/lib/stripe';
import Head from "next/head";
import { ImageContainer, SuccessContainer } from '@/styles/pages/success';
import { GetServerSideProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import Stripe from 'stripe';

interface SuccessProps {
  customerName: string;
  product: {
    name: string;
    imageUrl: string;
  }
}

const Success = ({ customerName, product }: SuccessProps) => {
  return (
    <>
      <Head>
        <title>Compra Efetuada | Ignite Shop</title>

        <meta name="robots" content="noindex"/>
      </Head>
      <SuccessContainer>
        <h1>Compra Efeutada!</h1>

        <ImageContainer>
          <Image src={product.imageUrl} width={120} height={110} alt=""/>
        </ImageContainer>

        <p>
          Uhuul <strong>{customerName}</strong>, sua <strong>{product.name}</strong> já está a caminha da sua casa.
        </p>

        <Link href="/">
            Voltar ao catálogo
        </Link>
      </SuccessContainer>
    </>
  )
}

export default Success;

export const getServerSideProps: GetServerSideProps = async({ query }) => {
  if(!query?.session_id){
    return {
      redirect: {
        destination: '/',
        permanent: false,
      }
    }
  }

  const { session_id: sessionId } = query;
  
  const session = await stripe.checkout.sessions.retrieve(String(sessionId), {
    expand: ['line_items', 'line_items.data.price.product']
  });

  const costumerName = session.customer_details?.name;
  const product = session.line_items?.data[0].price?.product as Stripe.Product

  return {
    props: {
      customerName: costumerName,
      product: {
        name: product.name,
        imageUrl: product.images[0],
      }
    }
  }
}