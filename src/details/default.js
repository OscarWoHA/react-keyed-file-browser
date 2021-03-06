import PropTypes from 'prop-types'
import React from 'react'
import { withNamespaces } from 'react-i18next'

class Detail extends React.Component {
  static propTypes = {
    file: PropTypes.shape({
      key: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      extension: PropTypes.string.isRequired,
      url: PropTypes.string,
    }).isRequired,
    close: PropTypes.func,
  }

  handleCloseClick = (event) => {
    if (event) {
      event.preventDefault()
    }
    this.props.close()
  }

  render() {
    const { t } = this.props
    let name = this.props.file.key.split('/')
    name = name.length ? name[name.length - 1] : ''

    return (
      <div>
        <h2>{t('itemDetail')}</h2>
        <dl>
          <dt>Key</dt>
          <dd>{this.props.file.key}</dd>

          <dt>{t('name')}</dt>
          <dd>{name}</dd>
        </dl>
        <a href="#" onClick={this.handleCloseClick}>Close</a>
      </div>
    )
  }
}

export default withNamespaces()(Detail)
