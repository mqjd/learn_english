/** @jsx jsx */
import * as React from "react";
import { jsx } from "theme-ui";
import { Link } from "gatsby";
import useMinimalBlogConfig from "../../hooks/use-minimal-blog-config";
import replaceSlashes from "../../utils/replaceSlashes";

type NavigationProps = {
  nav: {
    title: string;
    slug: string;
  }[];
};

const Navigation = ({ nav }: NavigationProps) => {
  const { basePath } = useMinimalBlogConfig();

  return (
    <React.Fragment>
      {nav && nav.length > 0 && (
        <nav
          sx={{
            "a:not(:last-of-type)": { mr: 3 },
            fontSize: ["1em", "1.25em", "1.25em"],
            ".active": { color: `heading` },
          }}
        >
          {nav.map((item) => (
            <Link
              activeClassName="active"
              key={item.slug}
              sx={(t: any) => ({ ...t.styles?.a })}
              to={replaceSlashes(`/${basePath}/${item.slug}`)}
            >
              {item.title}
            </Link>
          ))}
        </nav>
      )}
    </React.Fragment>
  );
};

export default Navigation;
