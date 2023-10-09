import { useBlockProps, RichText } from '@wordpress/block-editor';
//import { __ } from '@wordpress/i18n';

export default function save( { attributes } ) {
	const { name, bio, alt, url, id } = attributes;
	return (
		<div { ...useBlockProps.save() }>
			{ url && (
				<img
					src={ url }
					alt={ alt }
					className={ id ? `wp-image-${ id }` : null }
				/>
			) }
			<RichText.Content tagName="h4" value={ name } />
			<RichText.Content tagName="p" value={ bio } />
		</div>
	);
}
