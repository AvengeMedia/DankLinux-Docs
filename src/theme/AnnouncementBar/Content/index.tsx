import React, {type ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';
import type {Props} from '@theme/AnnouncementBar/Content';

export default function AnnouncementBarContent(props: Props): ReactNode {
  return (
    <div {...props}>
      <b>
        <Translate id="custom.announcement.title">
          DMS 1.5 &quot;The Wolverine&quot; is here
        </Translate>
      </b>
      {' — '}
      <Translate id="custom.announcement.summary">
        Frame Mode, DankCalendar integration, Hyprland Lua, and a lot more.
      </Translate>{' '}
      <Link to="/blog/v1-5-release">
        <Translate id="custom.announcement.readMore">
          Read the announcement
        </Translate>
      </Link>
    </div>
  );
}
