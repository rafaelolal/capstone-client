import { GetServerSidePropsContext } from "next";
import { ParsedUrlQuery } from "querystring";

export default function QuestionsPage(props: { question: { id: string } }) {
  return <p>Question: {props.question.id}</p>;
}

type MyContext = GetServerSidePropsContext & {
  params: ParsedUrlQuery & { id: string };
};

// TODO: use getStaticProps
export function getServerSideProps(context: MyContext) {
  const { id } = context.params;

  return {
    props: {
      question: { id },
    },
  };
}
