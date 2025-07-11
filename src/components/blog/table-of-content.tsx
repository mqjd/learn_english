/** @jsx jsx */
import * as React from 'react';
import { jsx } from 'theme-ui';
import './table-of-content.css';

export type TableOfContentItemProps = {
  url: string;
  title: string;
  items: TableOfContentItemProps[];
};

export const TableOfContentItem = (props: TableOfContentItemProps) => {
  return (
    <li className="table-of-content-item">
      <a
        href={props.url}
        sx={{ display: 'block', margin: '0.5em 0' }}
        className="table-of-content-link"
      >
        {props.title}
      </a>
      {props.items && props.items.length > 0 && (
        <ul sx={{ paddingLeft: '1em' }} className="table-of-content-group">
          {props.items.map((item, index) => (
            <TableOfContentItem key={index} {...item} />
          ))}
        </ul>
      )}
    </li>
  );
};

export const TableOfContent = ({ items }: TableOfContentItemProps) => {
  return (
    <div className="table-of-content">
      <ul className="table-of-content-group">
        {items.map((item, index) => (
          <TableOfContentItem key={index} {...item} />
        ))}
      </ul>
    </div>
  );
};
