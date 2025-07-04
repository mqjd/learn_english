/** @jsx jsx */
import { Link } from "gatsby";
import { jsx } from "theme-ui";
import replaceSlashes from "../../utils/replaceSlashes";
import useSiteMetadata from "../../hooks/use-site-metadata";
import useMinimalBlogConfig from "../../hooks/use-minimal-blog-config";

const HeaderTitle = () => {
  const { siteTitle } = useSiteMetadata();
  const { basePath, relativePath } = useMinimalBlogConfig();

  return (
    <Link
      to={replaceSlashes(`/${relativePath}/${basePath}`)}
      aria-label={`${siteTitle} - Back to home`}
      sx={{ color: `heading`, textDecoration: `none` }}
    >
      <div
        sx={{ my: 0, fontWeight: `semibold`, fontSize: ["1.5em", "1.875em"] }}
      >
        {siteTitle}
      </div>
    </Link>
  );
};

export default HeaderTitle;
