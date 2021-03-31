import fs from "fs";
import path from "path";

import Head from "next/head";
// import styles from "../styles/Home.module.css";÷
// import Introduction from "./../_posts/Introduction.mdx";
import renderToString from "next-mdx-remote/render-to-string";
import hydrate from "next-mdx-remote/hydrate";

import { getAllPostSlugs, getPostdata } from "../../lib/posts";

// import Heading from "~/../../components/heading";
import Header from "~/../../components/Header";
import DefaultLayout from "~/../../components/DefaultLayout";

import { IconArrowUpRight, Space, Typography } from "@supabase/ui";

// import { getPostdata } from "../lib/posts";
import ComponentIndex from "../../components/ComponentIndex";
import CodeSample from "../../components/CodeSample";
import matter from "gray-matter";
import ReactMarkdown from "react-markdown";

// import ButtonSample from "../../_components/button/sample";

const components = { CodeSample, Header, ...ComponentIndex };

// const components = { ButtonSample };

export default function Home({ source, frontmatter, toc }: any) {
  const gfm = require("remark-gfm");

  // console.log("frontmatter", frontmatter);
  // console.log("toc", toc);
  const content = hydrate(source, { components });

  const TableOfContents = toc && (
    <Space direction="vertical" size={8} className="py-8 lg:py-0">
      <div>
        <Typography>
          <Typography.Title level={5}>Table of contents</Typography.Title>
          <ReactMarkdown plugins={[gfm]}>{toc.content}</ReactMarkdown>
        </Typography>
      </div>
    </Space>
  );

  return (
    <DefaultLayout>
      <div className="grid grid-cols-12 container px-8 lg:py-16 mx-auto">
        <article className="col-span-7">
          <Typography.Title>{frontmatter.title}</Typography.Title>
          <Typography.Title level={3}>
            {frontmatter.description}
          </Typography.Title>
          <Typography.Text>
            <div className="my-8 text-sm">
              <a
                href="https://github.com/supabase/ui"
                style={{ textDecoration: "none" }}
              >
                <Space>
                  <span>View source</span>
                  <Typography.Text type="secondary">
                    <IconArrowUpRight strokeWidth={1.5} size="tiny" />
                  </Typography.Text>
                </Space>
              </a>

              <a
                href="https://github.com/supabase/ui"
                style={{ textDecoration: "none" }}
              >
                <Space>
                  <span>Report an issue</span>
                  <Typography.Text type="secondary">
                    <IconArrowUpRight strokeWidth={1.5} size="tiny" />
                  </Typography.Text>
                </Space>
              </a>
            </div>
          </Typography.Text>
          {/* <Header img={frontmatter.img} /> */}
          <div className="py-0">
            <Typography>{content}</Typography>
          </div>
        </article>
        <div className="col-span-2 col-start-11">{TableOfContents}</div>
      </div>
    </DefaultLayout>
  );
}

export async function getStaticPaths() {
  const paths = getAllPostSlugs("_components");
  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }: any) {
  // plugins for next-mdx-remote
  const gfm = require("remark-gfm");
  const slug = require("rehype-slug");

  // table of contents extractor
  const toc = require("markdown-toc");

  //Finding directory named "blog" from the current working directory of Node.
  const filePath = `${params.slug}/index`;
  const postDirectory = path.join(process.cwd(), "_components");
  const fullPath = path.join(postDirectory, `${filePath}.mdx`);
  const fileContent = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContent);

  const mdxSource: any = await renderToString(content, {
    components,
    scope: data,
    mdxOptions: {
      remarkPlugins: [gfm],
      rehypePlugins: [slug],
    },
  });

  return {
    props: {
      source: mdxSource,
      frontmatter: {
        ...data,
      },
      toc: toc(content, { maxdepth: 2 }),
    },
  };
}