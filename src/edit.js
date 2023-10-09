import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InnerBlocks,
	InspectorControls,
} from '@wordpress/block-editor';
//import { useState } from '@wordpress/element';
import { PanelBody, RangeControl } from '@wordpress/components';
import './editor.scss';

export default function Edit( props ) {
	const { columns } = props.attributes;
	const onChangeColumns = ( newColumns ) => {
		props.setAttributes( {
			columns: newColumns,
		} );
	};
	//const [columns, setColumns] = useState(2);
	return (
		<div
			{ ...useBlockProps( {
				className: `has-${ columns }-columns`,
			} ) }
		>
			<InspectorControls>
				<PanelBody>
					<RangeControl
						label={ __( 'Columns', 'team-members' ) }
						min={ 1 }
						max={ 6 }
						value={ columns }
						onChange={ onChangeColumns }
						initialPosition={ 2 }
					/>
				</PanelBody>
			</InspectorControls>
			<InnerBlocks
				allowedBlocks={ [ 'blocks-u/team-member' ] }
				orientation="horizonatal"
				template={ [
					[ 'blocks-u/team-member' ],
					[ 'blocks-u/team-member' ],
				] }
			/>
		</div>
	);
}
