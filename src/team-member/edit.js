import { useEffect, useState, useRef } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import {
	useBlockProps,
	RichText,
	MediaPlaceholder,
	BlockControls,
	MediaReplaceFlow,
	InspectorControls,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { isBlobURL, revokeBlobURL } from '@wordpress/blob';
import {
	Spinner,
	withNotices,
	ToolbarButton,
	PanelBody,
	TextareaControl,
	TextControl,
	Button,
	SelectControl,
	Icon,
	Tooltip,
} from '@wordpress/components';
import { usePrevious } from '@wordpress/compose';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
	DndContext,
	useSensor,
	useSensors,
	PointerSensor,
} from '@dnd-kit/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
	SortableContext,
	horizontalListSortingStrategy,
	arrayMove,
} from '@dnd-kit/sortable';
// eslint-disable-next-line import/no-extraneous-dependencies
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import SortableItem from './sortableItem';

function Edit( {
	attributes,
	setAttributes,
	context,
	noticeOperations,
	noticeUI,
	isSelected,
} ) {
	const { name, bio, url, alt, id, socialLinks } = attributes;
	const [ blobURL, setBlobURL ] = useState();
	const [ selectedLink, setSelectedLink ] = useState();
	const tittleRef = useRef();
	const previousUrl = usePrevious( url );
	const prevIsSelected = usePrevious( isSelected );

	const sensors = useSensors(
		useSensor( PointerSensor, {
			activationConstraint: { distance: 5 },
		} )
	);

	const imageObject = useSelect(
		( select ) => {
			const { getMedia } = select( 'core' );
			return id ? getMedia( id ) : null;
		},
		[ id ]
	);

	const imageSizes = useSelect( ( select ) => {
		return select( blockEditorStore ).getSettings().imageSizes;
	}, [] );

	const getImageSizeOptions = () => {
		if ( ! imageObject ) return [];
		const options = [];
		const sizes = imageObject.media_details.sizes;
		for ( const key in sizes ) {
			const size = sizes[ key ];
			const imageSize = imageSizes.find( ( s ) => s.slug === key );
			if ( imageSize ) {
				options.push( {
					label: imageSize.name,
					value: size.source_url,
				} );
			}
		}
		return options;
	};

	const onChangeName = ( newName ) => {
		setAttributes( { name: newName } );
	};
	const onChangeBio = ( newBio ) => {
		setAttributes( { bio: newBio } );
	};
	const onChangeAlt = ( newAlt ) => {
		setAttributes( { alt: newAlt } );
	};
	const onSelectImage = ( image ) => {
		if ( ! image || ! image.url ) {
			setAttributes( { url: undefined, id: undefined, alt: '' } );
			return;
		}
		setAttributes( { url: image.url, id: image.id, alt: image.alt } );
	};
	const onSelectURL = ( newURL ) => {
		setAttributes( {
			url: newURL,
			id: undefined,
			alt: '',
		} );
	};
	const onChangeImageSize = ( newURL ) => {
		setAttributes( {
			url: newURL,
		} );
	};
	const onUploadError = ( message ) => {
		noticeOperations.removeAllNotices();
		noticeOperations.createErrorNotice( message );
	};

	const removeImage = () => {
		setAttributes( {
			url: undefined,
			id: undefined,
			alt: '',
		} );
	};

	const addNewSocialItem = () => {
		setAttributes( {
			socialLinks: [ ...socialLinks, { icon: 'wordpress', link: '' } ],
		} );
		setSelectedLink( socialLinks.length );
	};

	const updateSocialItem = ( type, value ) => {
		const socialLinksCopy = [ ...socialLinks ];
		socialLinksCopy[ selectedLink ][ type ] = value;
		setAttributes( { socialLinks: socialLinksCopy } );
	};

	const removeSocialItem = () => {
		setAttributes( {
			socialLinks: [
				...socialLinks.slice( 0, selectedLink ),
				...socialLinks.slice( selectedLink + 1 ),
			],
		} );
		setSelectedLink();
	};

	const handleDragEnd = ( event ) => {
		const { active, over } = event;
		if ( active?.id !== over?.id ) {
			const oldIndex = socialLinks.findIndex(
				( item ) => active.id === `${ item.icon }-${ item.link }`
			);
			const newIndex = socialLinks.findIndex(
				( item ) => over.id === `${ item.icon }-${ item.link }`
			);
			setAttributes( {
				socialLinks: arrayMove( socialLinks, oldIndex, newIndex ),
			} );
			setSelectedLink( newIndex );
		}
	};

	useEffect( () => {
		if ( ! id && isBlobURL( url ) ) {
			setAttributes( {
				url: undefined,
				alt: '',
			} );
		}
	} );
	useEffect( () => {
		if ( isBlobURL( url ) ) {
			setBlobURL( url );
		} else {
			revokeBlobURL( blobURL );
			setBlobURL();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ url ] );

	useEffect( () => {
		if ( url && ! previousUrl && isSelected ) tittleRef.current.focus();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ url, previousUrl ] );

	useEffect( () => {
		if ( prevIsSelected && ! isSelected ) {
			setSelectedLink();
		}
	}, [ isSelected, prevIsSelected ] );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Image Settings', 'team-members' ) }>
					{ id && (
						<SelectControl
							label={ __( 'Image Size', 'team-members' ) }
							options={ getImageSizeOptions() }
							value={ url }
							onChange={ onChangeImageSize }
						/>
					) }
					{ url && ! isBlobURL( url ) && (
						<TextareaControl
							label={ __( 'Alt text', 'team-members' ) }
							value={ alt }
							onChange={ onChangeAlt }
							help={ __(
								"Alternate text (Alt text) is a text description that can be added to an image's HTML tag on a Web page. It is used when the image in the Web page cannot be displayed, in which case the Alt text is shown instead",
								'team-members'
							) }
						/>
					) }
				</PanelBody>
			</InspectorControls>
			{ url && (
				<BlockControls group="inline">
					<MediaReplaceFlow
						name={ __( 'Replace Image', 'team-members' ) }
						onSelect={ onSelectImage }
						onSelectURL={ onSelectURL }
						onError={ onUploadError }
						accept="image/*"
						allowedTypes={ [ 'image' ] }
						mediaId={ id }
						mediaURL={ url }
					/>
					<ToolbarButton onClick={ removeImage }>
						{ __( 'Remove Image', 'team-members' ) }
					</ToolbarButton>
				</BlockControls>
			) }

			<div { ...useBlockProps() }>
				{ url && (
					<div
						className={ `wp-block-blocks-u-team-member-img${
							isBlobURL( url ) ? ' is-loading' : ''
						}` }
					>
						<img src={ url } alt={ alt } />
						{ isBlobURL( url ) && <Spinner /> }
					</div>
				) }
				<MediaPlaceholder
					icon="admin-users"
					onSelect={ onSelectImage }
					onSelectURL={ onSelectURL }
					onError={ onUploadError }
					accept="image/*"
					allowedTypes={ [ 'image' ] }
					disableMediaButtons={ url }
					notices={ noticeUI }
				/>
				{ context[ 'blocks-u/team-members-columns' ] }
				<RichText
					ref={ tittleRef }
					placeholder={ __( 'Member Name', 'team-members' ) }
					tagName="h4"
					onChange={ onChangeName }
					value={ name }
					allowedFormats={ [] }
				/>
				<RichText
					placeholder={ __( 'Member Bio', 'team-members' ) }
					tagName="p"
					onChange={ onChangeBio }
					value={ bio }
					allowedFormats={ [] }
				/>
				<div className="wp-block-blocks-u-team-member-social-links">
					<ul>
						<DndContext
							sensors={ sensors }
							onDragEnd={ handleDragEnd }
							modifiers={ [ restrictToHorizontalAxis ] }
						>
							<SortableContext
								items={ socialLinks.map(
									( item ) => `${ item.icon }-${ item.link }`
								) }
								strategy={ horizontalListSortingStrategy }
							>
								{ socialLinks.map( ( item, index ) => {
									return (
										<SortableItem
											key={ `${ item.icon }-${ item.link }` }
											id={ `${ item.icon }-${ item.link }` }
											index={ index }
											selectedLink={ selectedLink }
											setSelectedLink={ setSelectedLink }
											icon={ item.icon }
										/>
									);
								} ) }
							</SortableContext>
						</DndContext>
						{ isSelected && (
							<li className="wp-block-blocks-u-team-member-add-icon">
								<Tooltip
									text={ __(
										'Add Social Link',
										'team-members'
									) }
								>
									<button
										aria-label={ __(
											'Add Social Link',
											'team-members'
										) }
										onClick={ addNewSocialItem }
									>
										<Icon icon="plus" />
									</button>
								</Tooltip>
							</li>
						) }
					</ul>
				</div>
				{ selectedLink !== undefined && (
					<div className="wp-block-blocks-u-team-member-link-form">
						<TextControl
							label={ __( 'Icon', 'team-members' ) }
							value={ socialLinks[ selectedLink ].icon }
							onChange={ ( icon ) => {
								updateSocialItem( 'icon', icon );
							} }
						/>
						<TextControl
							label={ __( 'URL', 'team-members' ) }
							value={ socialLinks[ selectedLink ].link }
							onChange={ ( link ) => {
								updateSocialItem( 'link', link );
							} }
						/>
						<br />
						<Button isDestructive onClick={ removeSocialItem }>
							{ __( 'Remove Link', 'text-members' ) }
						</Button>
					</div>
				) }
			</div>
		</>
	);
}

export default withNotices( Edit );
