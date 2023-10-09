import { useBlockProps, RichText } from '@wordpress/block-editor';
import { Icon } from '@wordpress/components';
//import { __ } from '@wordpress/i18n';

export default function save( { attributes } ) {
	const { name, bio, alt, url, id, socialLinks } = attributes;
	return (
		<div { ...useBlockProps.save() }>
			{ url && (
				<img
					src={ url }
					alt={ alt }
					className={ id ? `wp-image-${ id }` : null }
				/>
			) }
			{ name && <RichText.Content tagName="h4" value={ name } /> }
			{ bio && <RichText.Content tagName="p" value={ bio } /> }
			{ socialLinks.length > 0 && (
				<div className="wp-block-blocks-u-team-member-social-links">
					<ul>
						{ socialLinks.map( ( item, index ) => {
							return (
								<li key={ index } data-icon={ item.icon }>
									<button>
										<a
											href={ item.link }
											target="_blank"
											rel="noreferrer noopener"
										>
											<Icon icon={ item.icon } />
										</a>
									</button>
								</li>
							);
						} ) }
					</ul>
				</div>
			) }
		</div>
	);
}
