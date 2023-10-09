//import { __ } from '@wordpress/i18n';
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function save( props ) {
	const { columns } = props.attributes;
	return (
		<div
			{ ...useBlockProps.save( {
				className: `has-${ columns }-columns`,
			} ) }
		>
			<InnerBlocks.Content />
		</div>
	);
}
